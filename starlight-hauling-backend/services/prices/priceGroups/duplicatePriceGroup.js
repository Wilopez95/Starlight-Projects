import omit from 'lodash/omit.js';

import knex from '../../../db/connection.js';

import PricesRepo from '../../../repos/prices.js';
import PriceGroupsRepo from '../../../repos/priceGroups.js';

const duplicatePriceGroup = async (ctxState, id, data) => {
  const trx = await knex.transaction();

  let priceGroup;
  try {
    priceGroup = await PriceGroupsRepo.getInstance(ctxState).createOne({ data }, trx);

    const repo = PricesRepo.getInstance(ctxState);
    const prices = await repo.getAllByDate(
      { condition: { priceGroupId: id, date: new Date() } },
      trx,
    );

    if (prices?.length) {
      const newPrices = prices?.map(price => ({
        ...omit(price, ['startAt', 'endAt', 'nextPrice']),
        priceGroupId: priceGroup.id,
      }));

      await repo.insertMany({ data: newPrices }, trx);
    }

    await trx.commit();
  } catch (error) {
    await trx.rollback();
    throw error;
  }

  return priceGroup;
};

export default duplicatePriceGroup;
