import MqSender from '../../amqp/sender.js';

import {
  AMQP_QUEUE_GENERATE_SUBSCRIPTION_ORDERS,
  SUBSCRIPTION_ORDERS_GENERATION_MAX_BATCH_SIZE,
} from '../../../config.js';

const mqSender = MqSender.getInstance();

export const publisher = async (ctx, { templates }) => {
  ctx.logger.debug(templates, `generateSubsOrders->publisher->templates`);
  const maxChunkSize = Number(SUBSCRIPTION_ORDERS_GENERATION_MAX_BATCH_SIZE) || 50; // avoid 0
  if (templates.length > maxChunkSize) {
    const chunksNumber = Math.ceil(templates.length / maxChunkSize);
    const chunks = templates.reduce((acc, _, idx) => {
      if (idx % chunksNumber === 0) {
        acc.push(templates.slice(idx, idx + chunksNumber));
      }
      return acc;
    }, []);
    await Promise.all(
      chunks.map(templatesChunk =>
        mqSender.sendTo(ctx, AMQP_QUEUE_GENERATE_SUBSCRIPTION_ORDERS, {
          templates: templatesChunk,
        }),
      ),
    );
  } else {
    await mqSender.sendTo(ctx, AMQP_QUEUE_GENERATE_SUBSCRIPTION_ORDERS, {
      templates,
    });
  }
  ctx.logger.info('Queued generation of subscription orders');
};
