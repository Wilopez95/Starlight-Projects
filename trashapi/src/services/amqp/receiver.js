/* eslint-disable default-param-last */
import logger from '../logger/index.js';
import Client from './client.js';

const defaultCallback = data =>
  logger.info(`[cb was missed]: Received message: ${JSON.stringify(data)}`);

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
            const msgBody = message?.content?.toString();
            if (msgBody) {
              let data;
              try {
                data = JSON.parse(msgBody);
              } catch (error) {
                logger.error(error, `Received message: ${msgBody}. Parsing is failed`);

                channel.ack(message);
              }
              if (data) {
                try {
                  await callback(data);
                } catch (error) {
                  logger.error(
                    error,
                    `Received message: ${JSON.stringify(
                      data,
                    )}. Processing by the specified callback is failed`,
                  );

                  if (deadLetterExchange) {
                    // eslint-disable-next-line max-depth
                    if (deadLetterExchange === message.fields.exchange) {
                      logger.error(
                        `Failed to process dead letter
                                            message ${msgBody} on ${queueName}. Rejecting...`,
                      );

                      return channel.ack(message);
                    }
                    if (!message.fields.redelivered) {
                      logger.error(`Requeuing ${msgBody} on ${queueName}`);

                      return channel.nack(message, false, true);
                    }
                    logger.error(
                      `Putting ${msgBody} on ${queueName}
                                            to dead letter (if setuped)`,
                    );

                    return channel.nack(message, false, false);
                  }
                }
              }
            } else {
              logger.error(
                `Certain message has no
                                content, message: ${message}, queue: ${queueName}`,
              );
            }

            channel.ack(message);
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

  async subscribe(queueName, callback, deadLetterExchange) {
    await this.receive(queueName, callback, deadLetterExchange);
  }
}
