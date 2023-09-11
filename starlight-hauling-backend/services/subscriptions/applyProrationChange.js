import knex from '../../db/connection.js';

import {
  pricingAlterSubscriptionServiceItem,
  pricingAlterSubscriptionLineItem,
} from '../pricing.js';

export const applyProrationChange = async (ctx, data) => {
  const { serviceItems } = data;

  const promises = [];

  const trx = await knex.transaction();

  try {
    for (const serviceItem of serviceItems) {
      const {
        id,
        prorationEffectiveDate,
        prorationEffectivePrice,
        prorationOverride,
        lineItems = [],
      } = serviceItem;

      const updatedServiceItem = {
        prorationEffectiveDate,
        prorationEffectivePrice,
        prorationOverride,
      };

      promises.push(pricingAlterSubscriptionServiceItem(ctx, { data: updatedServiceItem }, id));

      for (const lineItem of lineItems) {
        const {
          id: lineItemId,
          prorationEffectiveDate: lineProrationEffectiveDate,
          prorationEffectivePrice: lineProrationEffectivePrice,
          prorationOverride: lineItemProrationOverride,
        } = lineItem;

        const lineItemPromise = pricingAlterSubscriptionLineItem(
          ctx,
          {
            data: {
              prorationEffectiveDate: lineProrationEffectiveDate,
              prorationEffectivePrice: lineProrationEffectivePrice,
              prorationOverride: lineItemProrationOverride,
            },
          },
          lineItemId,
        );

        promises.push(lineItemPromise);
      }
    }
    await Promise.all(promises);
    await trx.commit();
  } catch (err) {
    await trx.rollback();

    throw err;
  }
};
