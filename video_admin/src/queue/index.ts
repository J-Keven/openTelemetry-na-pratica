
import rabbitmq from "amqplib";

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
    console.log("Connected to RabbitMQ");
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
      console.log(`No events to notify for ${event}`);
    }
  }

  public async notify(
    message: string,
    exchange: string,
    routingKey: string,
    retries?: number
  ): Promise<boolean> {
    const retriesParse = retries || 1;
    let published = false;

    try {
      published = this._channel.publish(
        exchange,
        routingKey,
        Buffer.from(message),
        {
          persistent: true,
        }
      );
      console.log(`Notified ${message} to ${routingKey}`);
    } catch (err: any) {
      const errors = ["Connection closing", "Channel closing"];
      if (retriesParse < 2 && errors.includes(err.message as string)) {
        this._connection = undefined;
        await this.connect();

        published = await this.notify(
          message,
          exchange,
          routingKey,
          retriesParse + 1
        );
      } else {
        console.error(
          `Error on emitter email recovery event. Error ${JSON.stringify(err)}`
        );
        throw err;
      }
    }

    return published;
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
