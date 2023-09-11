import httpStatus from 'http-status';

import BusinessUnitRepo from '../../../repos/businessUnit.js';
import BusinessLineRepo from '../../../repos/businessLine.js';
import CustomerGroupRepo from '../../../repos/customerGroup.js';
import MerchantRepo from '../../../repos/merchant.js';
import BusinessUnitLineRepo from '../../../repos/businessUnitLine.js';
import PricesRepo from '../../../repos/prices.js';

import { mathRound2 } from '../../../utils/math.js';
// import { PRICE_ENTITY_TYPE } from '../../../consts/priceEntityTypes.js';

const PRICE_VALUES_DIVIDER = 1e6;

export const testIntegration = async ctx => {
  const { schemaName, businessUnitId, businessLineId, customerGroupId } = ctx.state.sp;

  const [businessUnit, businessLine, customerGroup] = await Promise.all([
    BusinessUnitRepo.getInstance(ctx.state, { schemaName }).getById({
      id: businessUnitId,
      fields: ['id', 'spUsed', 'merchant_id'],
    }),
    BusinessLineRepo.getInstance(ctx.state, { schemaName })
      .getBy({
        condition: { [`${BusinessLineRepo.TABLE_NAME}.id`]: businessLineId },
        fields: [`${BusinessLineRepo.TABLE_NAME}.id as id`],
      })
      // check for mapped bu-bl relation
      .innerJoin(
        BusinessUnitLineRepo.TABLE_NAME,
        `${BusinessUnitLineRepo.TABLE_NAME}.business_line_id`,
        `${BusinessLineRepo.TABLE_NAME}.id`,
      ),
    CustomerGroupRepo.getInstance(ctx.state, { schemaName }).getById({
      id: customerGroupId,
      fields: ['id'],
    }),
  ]);
  // TODO: return errors in body and handle it
  if (!businessUnit || !businessLine || !customerGroup) {
    ctx.status = httpStatus.NOT_FOUND;
    return;
  }
  if (businessUnit.spUsed) {
    ctx.status = httpStatus.CONFLICT;
    return;
  }

  const merchant = await MerchantRepo.getInstance(ctx.state, { schemaName }).getById({
    id: businessUnit.merchantId,
    fields: ['salespointMid', 'salespointUsername', 'salespointPassword'],
  });
  if (!merchant.salespointMid || !merchant.salespointUsername || !merchant.salespointPassword) {
    ctx.status = httpStatus.PAYMENT_REQUIRED;
    return;
  }

  ctx.status = httpStatus.OK;
};

const ratesMapper = item => (item.price = mathRound2(Number(item.price) / PRICE_VALUES_DIVIDER));

export const getRates = async ctx => {
  const { schemaName, businessUnitId, businessLineId } = ctx.state.sp;

  const date = new Date();
  const entityType = 'oneTimeService';
  const repo = PricesRepo.getInstance(ctx.state, { schemaName });

  const [globalRates, customRates] = await Promise.all([
    repo.getAllGeneralForSalesPoint({
      condition: { entityType, date },
      priceGroupCondition: {
        businessUnitId,
        businessLineId,
      },
    }),
    repo.getAllCustomForSalesPoint({
      condition: { entityType, date },
      priceGroupCondition: {
        businessUnitId,
        businessLineId,
      },
    }),
  ]);

  const result = { global: globalRates?.map(ratesMapper) ?? [] };

  if (customRates?.length) {
    const saToPriceGroupsMap = new Map();

    customRates.forEach(pg => {
      pg.serviceAreaIds?.forEach(saId => saToPriceGroupsMap.set(saId, pg.id));
    });

    result.custom = customRates?.map(ratesMapper) ?? [];

    result.map = [...saToPriceGroupsMap.entries()];
  }

  return ctx.sendObj(result);
};
