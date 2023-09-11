import { logger } from '../utils/logger.js';
import MqSender from './amqp/sender.js';

const mqSender = MqSender.getInstance();

const sendToMq = async (queueName, data) => {
  try {
    await mqSender.sendTo(queueName, data);
  } catch (error) {
    logger.error(error);
  }
};

// TODO: populate this with core related topics
export const sendToCore = data => sendToMq('core_channel', data);
