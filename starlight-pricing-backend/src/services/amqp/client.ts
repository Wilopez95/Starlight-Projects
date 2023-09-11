import * as Amqp from 'amqp-ts';
import { Channel, Options, Connection } from 'amqplib';

import { AMQP_HOSTNAME, AMQP_USERNAME, AMQP_PORT, AMQP_PASSWORD } from '../../config/config';
import { ISingleConsumer } from '../../Interfaces/RabittMQ';

const AMQP_URL = `amqp://${AMQP_USERNAME}:${AMQP_PASSWORD}@${AMQP_HOSTNAME}:${AMQP_PORT}`;

// Decision to use default exchange since future queues auto-bind to it with the same route key
// const DEFAULT_EXCHANGE = '';

export default class Client {
  connection: Amqp.Connection | Connection | null;
  channel: Channel | null;
  url: string;
  constructor() {
    this.url = AMQP_URL;
    this.connection = null;
    this.channel = null;
  }

  static getInstance() {
    return new this();
  }

  async assertQueue(
    queue: string,
    { singleConsumer }: ISingleConsumer = {},
    options: Options.AssertQueue = {},
  ) {
    Object.assign(options, { durable: true, exclusive: false });
    if (singleConsumer) {
      options.arguments = {
        'x-single-active-consumer': true,
      };
    }

    await this.channel?.assertQueue(queue, options).catch(error => {
      console.log(`Failed to assert a queue: ${queue}`);
      throw error;
    });
  }

  async deleteQueue(queue: string) {
    try {
      await this.channel?.deleteQueue(queue);
    } catch (error: unknown) {
      console.log(`Failed to delete a queue: ${queue}`);
      throw error;
    }
  }

  async deleteExchange(exchange: string) {
    try {
      await this.channel?.deleteExchange(exchange);
    } catch (error: unknown) {
      console.log(`Failed to delete a queue: ${exchange}`);
      throw error;
    }
  }

  async connect(prefetchLimit?: number) {
    if (!this.connection) {
      try {
        this.connection = new Amqp.Connection(this.url);
      } catch (error: unknown) {
        console.log(`Failed to connect via amqp for URL, host: ${AMQP_HOSTNAME}`);
        throw error;
      }
      this.connection.once('close', this.disconnect.bind(this, true));
      this.connection.once('error', this.disconnect.bind(this));
    }

    if (!this.channel) {
      try {
        this.channel = await (this.connection as Connection).createChannel();
      } catch (error: unknown) {
        console.log(`Failed to create a channel for the established connection`);
        throw error;
      }
      this.channel.once('close', this.dropChannel.bind(this, true));
      this.channel.once('error', this.dropChannel.bind(this));
    }

    if (prefetchLimit) {
      await this.channel.prefetch(prefetchLimit);
    }
  }

  async disconnect(closed?) {
    if (this.connection) {
      if (!closed) {
        try {
          await this.connection.close();
        } catch (error: unknown) {
          console.log(error);
        }
      }
      // eslint-disable-next-line no-unused-expressions
      this.connection.removeAllListeners();
    }
    this.connection = null;

    await this.dropChannel(closed);
  }

  async dropChannel(closed) {
    if (this.channel) {
      if (!closed) {
        try {
          await this.channel.close();
        } catch (error: unknown) {
          console.log(error);
        }
      }
      // eslint-disable-next-line no-unused-expressions
      this.channel.removeAllListeners();
    }
    this.channel = null;
  }

  toBuffer(data) {
    return Buffer.from(JSON.stringify(data), 'utf-8');
  }
}
