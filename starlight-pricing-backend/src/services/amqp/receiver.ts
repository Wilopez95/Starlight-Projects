import { ConsumeMessage } from 'amqplib';
import Client from './client';

const defaultCallback = (data: unknown) =>
  console.log(`[cb was missed]: Received message: ${JSON.stringify(data)}`);

export default class Receiver extends Client {
  static getInstance() {
    return new this();
  }

  async receive(
    queueName: string,
    callback: (data: unknown) => unknown = defaultCallback,
    deadLetterExchange: string,
  ) {
    await this.connect(1);

    try {
      await new Promise((resolve, reject) => {
        const { channel, connection } = this;
        if (!channel || !connection) {
          return;
        }
        channel.once('error', reject);
        connection.once('error', reject);
        channel.once('close', resolve);
        connection.once('close', resolve);

        channel.consume(
          queueName,
          async message => {
            const msgBody: string = message?.content.toString() ?? '';
            if (msgBody) {
              let data;
              try {
                data = JSON.parse(msgBody);
              } catch (error: unknown) {
                console.log(error, `Received message: ${msgBody}. Parsing is failed`);

                channel.ack(message as ConsumeMessage);
              }
              if (data) {
                try {
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  await callback(data);
                } catch (error: unknown) {
                  console.log(
                    error,
                    `Received message: ${JSON.stringify(
                      data,
                    )}. Processing by the specified callback is failed`,
                  );

                  if (deadLetterExchange) {
                    // eslint-disable-next-line max-depth
                    if (deadLetterExchange === message?.fields.exchange) {
                      console.log(
                        `Failed to process dead letter
                                            message ${msgBody} on ${queueName}. Rejecting...`,
                      );

                      return channel.ack(message);
                    } else if (!message?.fields.redelivered) {
                      console.log(`Requeuing ${msgBody} on ${queueName}`);

                      return channel.nack(message as ConsumeMessage, false, true);
                    } else {
                      console.log(
                        `Putting ${msgBody} on ${queueName}
                                            to dead letter (if setuped)`,
                      );

                      return channel.nack(message, false, false);
                    }
                  }
                }
              }
            } else {
              console.log(
                `Certain message has no
                                content, message: ${message}, queue: ${queueName}`,
              );
            }

            channel.ack(message as ConsumeMessage);
          },
          { noAck: false },
        );
      });
    } catch (error: unknown) {
      console.log(`Failed to consume messages from queue: ${queueName}`);
      console.log(error);
      throw error;
    } finally {
      await this.disconnect();
    }
  }

  async subscribe(
    queueName: string,
    callback: (data: unknown) => unknown,
    deadLetterExchange: string,
  ) {
    await this.receive(queueName, callback, deadLetterExchange);
  }
}
