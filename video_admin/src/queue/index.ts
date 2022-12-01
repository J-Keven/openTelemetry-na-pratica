
import rabbitmq from "amqplib";
import logger from "../logger"
import QueueInterface, { IEventData } from "./model";

export default class Queue implements QueueInterface {
  private _connection: rabbitmq.Connection | undefined;
  private _channel: rabbitmq.Channel;
  private _url: string;
  private events: { [key: string]: IEventData[] } = {};
  constructor(url: string) {
    this._url = url;
  }

  addEvent(event: string, data: IEventData): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(data);
  }

  public async connect(): Promise<void> {
    this._connection = await rabbitmq.connect(this._url);
    this._channel = await this._connection.createChannel();
    logger.info("Connected to RabbitMQ");
  }

  public get connection(): rabbitmq.Connection | undefined {
    return this._connection;
  }

  public async publishEvent(event: string): Promise<void> {
    if (this.events[event] && this.events[event].length !== 0) {
      Promise.all(
        this.events[event].map(async ({ exchange, payload, routing_key }) => {
          await this.notify(payload, exchange, routing_key);
          // this._channel.publish(exchange, routing_key, Buffer.from(payload));
        })
      );
    } else {
      logger.info(`No events to notify for ${event}`);
    }
  }

  public async notify(
    message: string,
    exchange: string,
    routingKey: string,
    retries?: number
  ): Promise<boolean> {
    const published = this._channel.publish(
      exchange,
      routingKey,
      Buffer.from(message),
      {
        persistent: true,
      }
    );

    return published
  }

  public async consumer(
    queue_name: string,
    callback: (message: rabbitmq.ConsumeMessage) => void
  ): Promise<void> {
    await this._channel.consume(queue_name, (message) => {
      if (message) {
        callback(message);
      }
    });
  }

  public ack(message: rabbitmq.ConsumeMessage): void {
    this._channel.ack(message);
  }

  public reject(message: rabbitmq.ConsumeMessage, requeue: boolean): void {
    this._channel.reject(message, requeue);
  }
}
