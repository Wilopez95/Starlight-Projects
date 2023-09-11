import logger from '../logger/index.js';
import Client from './client.js';

const contentType = 'application/json';

export default class Sender extends Client {
  async sendTo(queueName, data) {
    await this.connect();

    try {
      await this.channel.sendToQueue(queueName, this.toBuffer(data), {
        persistent: true,
        contentType,
      });
    } catch (error) {
      logger.error(`Failed to send a message to queue: ${queueName}`);
      throw error;
    }
  }

  async sendToExchange(exchange, routingKey, data) {
    await this.connect();

    try {
      await this.channel.publish(exchange, routingKey, this.toBuffer(data), {
        persistent: true,
        contentType,
      });
    } catch (error) {
      logger.error(`Failed to send a message to exchange: ${exchange}`, error);
    }
  }
}
