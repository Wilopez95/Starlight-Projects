import omit from 'lodash/fp/omit.js';

import MqSender from '../../amqp/sender.js';

import SubscriptionOrdersRepo from '../../../repos/subscriptionOrder/subscriptionOrder.js';

import {
  AMQP_QUEUE_GENERATE_SUBSCRIPTION_WOS,
  SUBSCRIPTION_WOS_GENERATION_MAX_BATCH_SIZE,
} from '../../../config.js';

const mqSender = MqSender.getInstance();

export const getEquipments = template => {
  let droppedItems = [];
  let pickedUpItems = [];
  const { quantity } = template;

  if (template.droppedEquipmentItem) {
    droppedItems = template.droppedEquipmentItem.split(',', quantity);
  }

  if (template.pickedUpEquipmentItem) {
    pickedUpItems = template.pickedUpEquipmentItem.split(',', quantity);
  }

  return {
    droppedItems,
    pickedUpItems,
  };
};

export const publisher = async (ctx, { templates }) => {
  const tasks = [];
  const maxChunkSize = Number(SUBSCRIPTION_WOS_GENERATION_MAX_BATCH_SIZE) || 50; // avoid 0
  for (const template of templates) {
    // pre-pricing service code:
    // const subscriptionWorkOrderDetails = await SubscriptionServiceItemRepo.getInstance(
    //   ctx.state,
    // ).getDetailsForRoutePlanner({
    //   serviceItemId: template.subscriptionServiceItemId,
    //   thirdPartyHaulerId: template.thirdPartyHaulerId,
    // });

    const subscriptionWorkOrderDetails = await SubscriptionOrdersRepo.getInstance(
      ctx.state,
      ctx.state.user,
    ).getDetailsForRoutePlanner(
      {
        // serviceItemId: template.subscriptionServiceItemId,
        orderId: template.subscriptionOrderId,
        thirdPartyHaulerId: template.thirdPartyHaulerId,
      },
      ctx,
    );

    const quantity = Number(template.quantity);
    const { droppedItems, pickedUpItems } = getEquipments(template);

    const subscriptionWorkOrdersTemplate = omit([
      'quantity',
      'preferredRoute',
      'subscriptionId',
      'subscriptionServiceItemId',
      'billableServiceId',
      'droppedEquipmentItem',
      'pickedUpEquipmentItem',
    ])(template);

    if (quantity > maxChunkSize) {
      const chunksNumber = Math.ceil(quantity / maxChunkSize);
      const lastChunkSize = quantity - maxChunkSize * (chunksNumber - 1);
      for (let i = 1; i <= chunksNumber; i++) {
        const chunkSize = i === chunksNumber ? lastChunkSize : maxChunkSize;
        tasks.push(
          mqSender.sendTo(ctx, AMQP_QUEUE_GENERATE_SUBSCRIPTION_WOS, {
            preferredRoute: template.preferredRoute,
            template: subscriptionWorkOrdersTemplate,
            quantity: chunkSize,
            subscriptionWorkOrderDetails,
            equipmentItem: {
              droppedItems: droppedItems.slice(
                maxChunkSize * (i - 1),
                maxChunkSize * (i - 1) + chunkSize,
              ),
              pickedUpItems: pickedUpItems.slice(
                maxChunkSize * (i - 1),
                maxChunkSize * (i - 1) + chunkSize,
              ),
            },
          }),
        );
      }
    } else {
      subscriptionWorkOrdersTemplate.droppedEquipmentItem = droppedItems;
      subscriptionWorkOrdersTemplate.pickedUpEquipmentItem = pickedUpItems;
      tasks.push(
        mqSender.sendTo(ctx, AMQP_QUEUE_GENERATE_SUBSCRIPTION_WOS, {
          ctx: ctx.state,
          preferredRoute: template.preferredRoute ? template.preferredRoute : '',
          template: subscriptionWorkOrdersTemplate,
          quantity,
          subscriptionWorkOrderDetails,
          equipmentItem: {
            droppedItems,
            pickedUpItems,
          },
        }),
      );
    }
  }
  await Promise.all(tasks);
};
