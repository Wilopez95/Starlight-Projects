import isEmpty from 'lodash/isEmpty.js';

import knex from '../../db/connection.js';

import PricesRepo from '../../repos/prices.js';
import PriceGroupsRepo from '../../repos/priceGroups.js';

import { PRICE_ENTITY_TYPE } from '../../consts/priceEntityTypes.js';

const upsertPrices = async (
  ctxState,
  { businessUnitId, businessLineId, priceGroupId, ...data },
) => {
  const repo = PricesRepo.getInstance(ctxState);

  const trx = await knex.transaction();

  try {
    const isCustomPriceGroupRatesUpdate = !!priceGroupId;
    // identify priceGroupId in case of global rates
    if (!isCustomPriceGroupRatesUpdate) {
      const priceGroup = await PriceGroupsRepo.getInstance(ctxState).getBy(
        {
          condition: {
            businessUnitId,
            businessLineId,
            isGeneral: true,
          },
          fields: ['id'],
        },
        trx,
      );

      // eslint-disable-next-line no-param-reassign
      priceGroupId = priceGroup.id;
    }

    const rates = [];
    const extObj = {
      priceGroupId,
      userId: ctxState?.userId,
      user: ctxState?.user?.email,
      traceId: ctxState?.reqId,
    };

    Object.entries(data).forEach(([key, value]) => {
      if (isEmpty(value)) {
        return null;
      }

      let val = value;
      if (Array.isArray(value)) {
        val = value.map(item => ({
          ...item,
          ...extObj,
          entityType: PRICE_ENTITY_TYPE[key],
        }));

        rates.push(...val);
      } else if (!isEmpty(value)) {
        rates.push({ ...value, ...extObj });
      }

      return [key, val];
    });

    if (!rates.length) {
      return {};
    }

    const now = new Date();

    const ratesToUpdate = rates
      .filter(item => item.id)
      .map(item => ({ id: item.id, nextPrice: item.price, endAt: now }));

    await repo.updateMany({ data: ratesToUpdate }, trx);

    const ratesToInsert = rates.map(({ id, ...item }) => ({
      ...item,
      startAt: now,
    }));

    await PricesRepo.getInstance(ctxState).insertMany({ data: ratesToInsert, fields: ['*'] }, trx);

    await trx.commit();
    return null;
  } catch (error) {
    await trx.rollback();
    throw error;
  }
};

export default upsertPrices;
