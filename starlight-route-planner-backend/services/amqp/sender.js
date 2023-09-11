import { generateTraceId } from '../../utils/generateTraceId.js';
import { pickRequiredTokenData } from '../../utils/userToken.js';
import Client from './client.js';

const contentType = 'application/json';

const getTechHeaders = ctx => {
  const headers = {
    reqId: ctx.reqId || ctx.state?.reqId || generateTraceId(),
    userId: ctx.userId || ctx.state?.userId || 'system',
  };

  // TODO: make this behavior optional
  if (ctx.state.userTokenData) {
    headers.tokenData = JSON.stringify(pickRequiredTokenData(ctx));
  }
  return headers;
};

export default class Sender extends Client {
  async sendTo(ctx, queueName, data, opts = { headers: {} }) {
    await this.connect();

    Object.assign(opts.headers, getTechHeaders(ctx));

    try {
      await this.channel.sendToQueue(queueName, this.toBuffer(data), {
        persistent: true,
        contentType,
        ...opts,
      });
    } catch (error) {
      ctx.logger.error(`Failed to send a message to queue: ${queueName}`);
      throw error;
    }
  }

  async sendToExchange(ctx, exchange, routingKey, data, opts = { headers: {} }) {
    await this.connect();

    Object.assign(opts.headers, getTechHeaders(ctx));

    try {
      await this.channel.publish(exchange, routingKey, this.toBuffer(data), {
        persistent: true,
        contentType,
        ...opts,
      });
    } catch (error) {
      ctx.logger.error(`Failed to send a message to exchange: ${exchange}`);
    }
  }
}
