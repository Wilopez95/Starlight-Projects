import amqp, { Connection } from 'amqplib/callback_api';
import { RABBITMQ_HOSTNAME, RABBITMQ_PASSWORD, RABBITMQ_USERNAME, RABBITMQ_PORT } from '../config';
import logger from './logger';
import { outMessages, disconnectSubject, subscribeSubject, inMessages, initSubject } from './queue';

let _connection: Connection | null = null;

const init = (): void => {
  amqp.connect(
    {
      hostname: RABBITMQ_HOSTNAME,
      username: RABBITMQ_USERNAME,
      password: RABBITMQ_PASSWORD,
      port: parseInt(RABBITMQ_PORT),
    },
    (error0, connection) => {
      _connection = connection;

      if (error0) {
        throw error0;
      }

      disconnectSubject.subscribe(() => {
        _connection?.close();
      });

      connection.createChannel((error1, channel) => {
        if (error1) {
          throw error1;
        }

        subscribeSubject.subscribe(({ type, bindings, assertQueue }) => {
          if (assertQueue) {
            channel.assertQueue(type);
          }

          if (bindings) {
            for (const binding of bindings) {
              const bindQueue = () =>
                channel.bindQueue(type, binding.exchange, binding.routingKey || '');

              if (!binding.assertExchange) {
                bindQueue();

                continue;
              }

              channel.assertExchange(binding.exchange, binding.type, binding.options, (err) => {
                if (err) {
                  logger.error(err, `Failed to asser exchange: ${JSON.stringify(binding)}`);

                  throw err;
                }

                bindQueue();
              });
            }
          }

          channel.consume(type, (envelope) => {
            if (!envelope) {
              return;
            }

            const message = JSON.parse(envelope.content.toString());

            channel.ack(envelope);

            inMessages.next({
              type,
              payload: message,
            });
          });
        });

        outMessages.subscribe((message) => {
          const queue = message.type;
          const msg = JSON.stringify(message.payload);

          if (message.assertQueue) {
            channel.assertQueue(queue, {
              durable: true,
            });
          }

          channel.sendToQueue(queue, Buffer.from(msg), {
            persistent: true,
          });
        });
      });
    },
  );
};

initSubject.subscribe(init);
