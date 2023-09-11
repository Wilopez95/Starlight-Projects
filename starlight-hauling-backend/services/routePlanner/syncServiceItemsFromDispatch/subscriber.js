import { pricingAlterSubscriptionServiceItem } from '../../pricing.js';

export const subscriber = async (ctx, { serviceItems }) => {
  ctx.logger.debug(
    serviceItems,
    `
        syncServiceItemFromDispatch->subscriber->serviceItems
    `,
  );

  try {
    for (const item of serviceItems) {
      await pricingAlterSubscriptionServiceItem(
        ctx,
        {
          data: { serviceDaysOfWeek: item.serviceDaysOfWeek },
        },
        item.id,
      );
    }
  } catch (error) {
    ctx.logger.warn(`Failed to sync serviceItems from Route planner`);
    ctx.logger.error(error);
  }
};
