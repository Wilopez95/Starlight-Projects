import Client from './client';

const contentType = 'application/json';

export default class Sender extends Client {
  async sendTo(queueName: string, data: unknown, _opts?: unknown) {
    await this.connect();

    try {
      // eslint-disable-next-line @typescript-eslint/await-thenable
      await this.channel?.sendToQueue(queueName, this.toBuffer(data), {
        persistent: true,
        contentType,
      });
    } catch (error: unknown) {
      console.log(`Failed to send a message to queue: ${queueName}`);
      throw error;
    }
  }

  async sendToExchange(exchange: string, routingKey: string, data) {
    await this.connect();

    try {
      // eslint-disable-next-line @typescript-eslint/await-thenable
      await this.channel?.publish(exchange, routingKey, this.toBuffer(data), {
        persistent: true,
        contentType,
      });
    } catch (error: unknown) {
      console.log(`Failed to send a message to exchange: ${exchange}`, error);
    }
  }
}
