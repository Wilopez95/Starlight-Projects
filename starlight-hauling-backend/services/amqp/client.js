/* eslint-disable class-methods-use-this */
import amqp from 'amqplib';

import { logger } from '../../utils/logger.js';

import { AMQP_HOSTNAME, AMQP_USERNAME, AMQP_PASSWORD, AMQP_PORT } from '../../config.js';

const AMQP_URL = `amqp://${AMQP_USERNAME}:${AMQP_PASSWORD}@${AMQP_HOSTNAME}:${AMQP_PORT}`;

// Decision to use default exchange since future queues auto-bind to it with the same route key
// const DEFAULT_EXCHANGE = '';

export default class Client {
  constructor() {
    this.url = AMQP_URL;
    this.connection = null;
    this.channel = null;
  }

  static getInstance() {
    return new this();
  }

  async assertQueue(queue, { singleConsumer } = {}, options = {}) {
    Object.assign(options, { durable: true, exclusive: false });
    if (singleConsumer) {
      options.arguments = {
        'x-single-active-consumer': true,
      };
    }

    await this.channel.assertQueue(queue, options).catch(error => {
      logger.error(`Failed to assert a queue: ${queue}`);
      throw error;
    });
  }

  async deleteQueue(queue) {
    try {
      await this.channel.deleteQueue(queue);
    } catch (error) {
      logger.error(`Failed to delete a queue: ${queue}`);
      throw error;
    }
  }

  async deleteExchange(exchange) {
    try {
      await this.channel.deleteExchange(exchange);
    } catch (error) {
      logger.error(`Failed to delete a queue: ${exchange}`);
      throw error;
    }
  }

  async connect(prefetchLimit) {
    if (!this.connection) {
      try {
        this.connection = await amqp.connect(this.url);
      } catch (error) {
        logger.error(`Failed to connect via amqp for URL, host: ${AMQP_HOSTNAME}`);
        throw error;
      }
      this.connection.once('close', this.disconnect.bind(this, true));
      this.connection.once('error', this.disconnect.bind(this));
    }

    if (!this.channel) {
      try {
        this.channel = await this.connection.createChannel();
      } catch (error) {
        logger.error(`Failed to create a channel for the established connection`);
        throw error;
      }
      this.channel.once('close', this.dropChannel.bind(this, true));
      this.channel.once('error', this.dropChannel.bind(this));
    }

    if (prefetchLimit) {
      await this.channel.prefetch(prefetchLimit);
    }
  }

  async disconnect(closed) {
    if (this.connection) {
      if (!closed) {
        try {
          await this.connection.close();
        } catch (error) {
          logger.info(error?.stackAtStateChange ?? error);
        }
      }
      this.connection?.removeAllListeners();
    }
    this.connection = null;

    await this.dropChannel(closed);
  }

  async dropChannel(closed) {
    if (this.channel) {
      if (!closed) {
        try {
          await this.channel.close();
        } catch (error) {
          logger.info(error?.stackAtStateChange ?? error);
        }
      }
      this.channel?.removeAllListeners();
    }
    this.channel = null;
  }

  toBuffer(data) {
    return Buffer.from(JSON.stringify(data), 'utf-8');
  }
}
