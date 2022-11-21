import rabbitmq from "amqplib";

export type IEventData = {
  payload: string;
  exchange: string;
  routing_key: string;
};

export default interface QueueInterface {
  addEvent(event: string, data: IEventData): void;
  publishEvent(event: string): Promise<void>;
  notify(
    message: string,
    exchange: string,
    routingKey: string,
    retries?: number
  ): Promise<boolean>;
  consumer(
    queue_name: string,
    callback: (message: rabbitmq.ConsumeMessage) => void
  ): Promise<void>;
  connect(): Promise<void>;
  ack(message: any): void;
  reject(message: any, requeue: boolean, err: Error | any | undefined): void;
}
