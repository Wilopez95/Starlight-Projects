import { promisify } from 'util';

import { createAppContext } from '../../utils/koaContext.js';
import { proceedToken } from '../../utils/userToken.js';
import { logger } from '../../utils/logger.js';
import Client from './client.js';

const defaultCallback = (ctx, data) =>
  ctx.logger.info(`[cb was missed]: Received message: ${JSON.stringify(data)}`);

export default class Receiver extends Client {
  constructor(...params) {
    super(params);
  }

  async receive(queueName, callback = defaultCallback, deadLetterExchange) {
    await this.connect(1);

    try {
      await new Promise((resolve, reject) => {
        const { channel, connection } = this;
        channel.once('error', reject);
        connection.once('error', reject);
        channel.once('close', resolve);
        connection.once('close', resolve);

        channel.consume(
          queueName,
          async message => {
            const traceId = message?.properties?.headers?.reqId;
            const accessToken = message?.properties?.headers?.accessToken;
            let tokenData = {};
            const ctx = await createAppContext({
              traceId,
              accessToken,
              dontCheckToken: true,
            });
            if (message?.properties?.headers?.tokenData) {
              try {
                tokenData = JSON.parse(message.properties.headers.tokenData);
                await proceedToken(ctx, {
                  tokenId: ctx.state.tokenId,
                  existingTokenData: tokenData,
                  dontCheck: true,
                });
              } catch (err) {
                ctx.logger.error(`Failed to proceed access token data for reqId: ${traceId}`);
                ctx.logger.error(err.message);
                throw err;
              }
            }

            const msgBody = message?.content?.toString();
            if (msgBody) {
              let data;
              try {
                data = JSON.parse(msgBody);
              } catch (error) {
                ctx.logger.error(error, `Received message: ${msgBody}. Parsing is failed`);

                channel.ack(message);
              }
              if (data) {
                try {
                  await callback(ctx, data);
                } catch (error) {
                  ctx.logger.error(
                    error,
                    `Received message: ${JSON.stringify(
                      data,
                    )}. Processing by the specified callback is failed`,
                  );

                  if (deadLetterExchange) {
                    if (deadLetterExchange === message.fields.exchange) {
                      ctx.logger.error(
                        `Failed to process dead letter message ${msgBody} on ${queueName}. Rejecting...`,
                      );

                      return channel.ack(message);
                    } else if (message.fields.redelivered) {
                      ctx.logger.error(
                        `Putting ${msgBody} on ${queueName} to dead letter (if configured)`,
                      );
                      return channel.nack(message, false, false);
                    } else {
                      ctx.logger.error(`Re-queuing ${msgBody} on ${queueName}`);
                      return channel.nack(message, false, true);
                    }
                  }
                }
              }
            } else {
              ctx.logger.error(
                `Certain message has no content, message: ${message}, queue: ${queueName}`,
              );
            }

            channel.ack(message);
            return true;
          },
          { noAck: false },
        );
      });
    } catch (error) {
      logger.error(`Failed to consume messages from queue: ${queueName}`);
      logger.error(error.message);
      throw error;
    } finally {
      await this.disconnect();
    }
  }

  async receiveAndAutoAck(queueName, callback = defaultCallback, deadLetterExchange) {
    await this.connect(1);

    try {
      await new Promise((resolve, reject) => {
        const { channel, connection } = this;
        channel.once('error', reject);
        connection.once('error', reject);
        channel.once('close', resolve);
        connection.once('close', resolve);

        channel.consume(
          queueName,
          async message => {
            const traceId = message?.properties?.headers?.reqId;
            const accessToken = message?.properties?.headers?.accessToken;
            let tokenData = {};
            const ctx = await createAppContext({
              traceId,
              accessToken,
              dontCheckToken: true,
            });
            if (message?.properties?.headers?.tokenData) {
              try {
                tokenData = JSON.parse(message.properties.headers.tokenData);
                await proceedToken(ctx, {
                  tokenId: ctx.state.tokenId,
                  existingTokenData: tokenData,
                  dontCheck: true,
                });
              } catch (err) {
                ctx.logger.error(`Failed to proceed access token data for reqId: ${traceId}`);
                ctx.logger.error(err.message);
                throw err;
              }
            }

            const msgBody = message?.content?.toString();
            if (msgBody) {
              let data;
              try {
                data = JSON.parse(msgBody);
              } catch (error) {
                ctx.logger.error(error, `Received message: ${msgBody}. Parsing is failed`);
              }
              if (data) {
                promisify(callback)(ctx, data).catch(error => {
                  ctx.logger.error(
                    error,
                    `Failed to process message: ${msgBody}.Queue: ${queueName},
                                        exchange: ${message.fields.exchange}, redelivered: ${message.fields.redelivered}.`,
                  );

                  if (deadLetterExchange) {
                    if (deadLetterExchange === message.fields.exchange) {
                      ctx.logger.error(
                        `Failed to process dead letter message ${msgBody} on ${queueName}. Rejecting...`,
                      );
                    } else if (message.fields.redelivered) {
                      ctx.logger.error(
                        `Putting ${msgBody} on ${queueName} to dead letter (if setuped)`,
                      );
                    } else {
                      ctx.logger.error(`Requeuing ${msgBody} on ${queueName}`);
                    }
                  }
                });
              }
            } else {
              ctx.logger.error(
                `Certain message has no content, message: ${message}, queue: ${queueName}`,
              );
            }
          },
          { noAck: true },
        );
      });
    } catch (error) {
      logger.error(`Failed to consume messages from queue: ${queueName}`);
      logger.error(error.message);
      throw error;
    } finally {
      await this.disconnect();
    }
  }

  async subscribe(queueName, callback, deadLetterExchange, autoAck = false) {
    if (autoAck) {
      await this.receiveAndAutoAck(queueName, callback, deadLetterExchange);
    } else {
      await this.receive(queueName, callback, deadLetterExchange);
    }
  }
}
