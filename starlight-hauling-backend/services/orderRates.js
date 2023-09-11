import GlobalRatesServiceRepo from '../repos/globalRatesService.js';
import GlobalRatesLineItemRepo from '../repos/globalRatesLineItem.js';
import GlobalRatesRecurringLineItemRepo from '../repos/globalRateRecurringLineItem.js';
import GlobalRatesSurchargeRepo from '../repos/globalRatesSurcharge.js';
import CustomGroupRatesServiceRepo from '../repos/customRatesGroupService.js';
import CustomGroupRatesLineItemRepo from '../repos/customRatesGroupLineItem.js';
import CustomGroupRatesSurchargeRepo from '../repos/customRatesGroupSurcharge.js';

import ApiError from '../errors/ApiError.js';

import { mathRound2 } from '../utils/math.js';
import isNilOrNaN from '../utils/isNilOrNumeric.js';

const priceToNumber = item => (item.price = mathRound2(Number(item.price)));

export const calcRates = async (
  ctxState,
  {
    businessUnitId,
    businessLineId,

    type,
    customRatesGroupId,

    billableService: { billableServiceId, equipmentItemId, materialId = null } = {},
    billableLineItems = [],

    recurringLineItemIds = [],
    billingCycle = null,
    billableServiceIds = [],
    applySurcharges = true,
  },
  trx,
) => {
  let globalRatesService;
  if (billableServiceId) {
    globalRatesService = await GlobalRatesServiceRepo.getInstance(ctxState).getBy(
      {
        condition: {
          businessUnitId,
          businessLineId,
          billableServiceId,
          equipmentItemId,
          materialId,
        },
      },
      trx,
    );

    if (!globalRatesService) {
      throw ApiError.notFound('Global rates for billable service item not found');
    }

    globalRatesService.price = mathRound2(Number(globalRatesService.price));
  }

  let globalRatesLineItems;
  if (billableLineItems?.length) {
    globalRatesLineItems = await GlobalRatesLineItemRepo.getInstance(
      ctxState,
    ).getByLineItemMappedIds(
      {
        mappedIds: billableLineItems,
        condition: { businessUnitId, businessLineId },
      },
      trx,
    );

    if (!globalRatesLineItems?.length) {
      throw ApiError.notFound('Global rates for billable line items not found');
    }

    globalRatesLineItems.forEach(priceToNumber);
  }

  let globalRatesServiceItems;
  if (billableServiceIds?.length) {
    globalRatesServiceItems = await GlobalRatesServiceRepo.getInstance(
      ctxState,
    ).getByServiceItemIds(
      {
        ids: billableServiceIds,
        condition: { businessUnitId, businessLineId },
      },
      trx,
    );

    if (!globalRatesServiceItems?.length) {
      throw ApiError.notFound('Global rates for billable service items not found');
    }

    globalRatesServiceItems.forEach(priceToNumber);
  }

  let globalRatesSurcharges;
  if (applySurcharges) {
    globalRatesSurcharges = await GlobalRatesSurchargeRepo.getInstance(ctxState).getAll(
      {
        condition: { businessUnitId, businessLineId },
      },
      trx,
    );
  }

  let globalRecurringLineItems;
  if (recurringLineItemIds?.length) {
    globalRecurringLineItems = await GlobalRatesRecurringLineItemRepo.getInstance(
      ctxState,
    ).getByRecurringLineItemIds(
      {
        ids: recurringLineItemIds,
        condition: { businessUnitId, businessLineId, billingCycle },
      },
      trx,
    );

    if (!globalRecurringLineItems?.length) {
      throw ApiError.notFound('Global rates for recurring line items not found');
    }

    globalRecurringLineItems.forEach(priceToNumber);
  }

  const ratesObj = {
    globalRates: {
      globalRatesService,
      globalRatesLineItems,
      globalRatesServiceItems,
      globalRecurringLineItems,
      globalRatesSurcharges,
    },
  };

  if (type === 'global') {
    return ratesObj;
  }

  let customRatesService;
  if (billableServiceId) {
    customRatesService = await CustomGroupRatesServiceRepo.getInstance(ctxState).getBy(
      {
        condition: {
          businessUnitId,
          businessLineId,
          customRatesGroupId,
          billableServiceId,
          equipmentItemId,
          materialId,
        },
      },
      trx,
    );

    if (customRatesService) {
      customRatesService.price = isNilOrNaN(customRatesService.price)
        ? globalRatesService.price
        : mathRound2(Number(customRatesService.price));
    }
  }

  let customRatesLineItems;
  if (billableLineItems?.length) {
    customRatesLineItems = await CustomGroupRatesLineItemRepo.getInstance(
      ctxState,
    ).getByLineItemMappedIds(
      {
        mappedIds: billableLineItems,
        condition: { businessUnitId, businessLineId, customRatesGroupId },
      },
      trx,
    );

    if (customRatesLineItems?.length) {
      customRatesLineItems.forEach(rateObj => {
        if (!isNilOrNaN(rateObj?.price)) {
          rateObj.price = mathRound2(Number(rateObj.price));
        } else {
          const globalRatesLineItem = globalRatesLineItems.find(
            item => rateObj.lineItemId === item.lineItemId,
          );
          if (!globalRatesLineItem) {
            throw ApiError.notFound('Global rates for specific billable line item not found');
          }
          rateObj.price = mathRound2(Number(globalRatesLineItem.price));
        }
      });
    }
  }

  let customRatesSurcharges;
  if (applySurcharges) {
    customRatesSurcharges = await CustomGroupRatesSurchargeRepo.getInstance(ctxState).getAll(
      {
        condition: { businessUnitId, businessLineId, customRatesGroupId },
      },
      trx,
    );
  }

  let customRecurringLineItems;
  if (recurringLineItemIds?.length) {
    customRecurringLineItems = await CustomGroupRatesLineItemRepo.getInstance(
      ctxState,
    ).getByRecurringLineItemIds(
      {
        ids: recurringLineItemIds,
        condition: { customRatesGroupId, billingCycle, businessUnitId, businessLineId },
      },
      trx,
    );

    if (customRecurringLineItems?.length) {
      customRecurringLineItems.forEach(rateObj => {
        if (!isNilOrNaN(rateObj?.price)) {
          rateObj.price = mathRound2(Number(rateObj.price));
        } else {
          const globalRatesRecurringLineItem = globalRecurringLineItems.find(
            item => rateObj.lineItemId === item.lineItemId,
          );
          if (!globalRatesRecurringLineItem) {
            throw ApiError.notFound('Global rates for specific recurring line item not found');
          }
          rateObj.price = mathRound2(Number(globalRatesRecurringLineItem.price));
        }
      });
    }
  }

  let customRatesServiceItems;
  if (billableServiceIds?.length) {
    customRatesServiceItems = await CustomGroupRatesServiceRepo.getInstance(
      ctxState,
    ).getByServiceItemIds(
      {
        ids: billableServiceIds,
        condition: { customRatesGroupId, businessUnitId, businessLineId },
      },
      trx,
    );

    if (customRatesServiceItems?.length) {
      customRatesServiceItems.forEach(rateObj => {
        if (!isNilOrNaN(rateObj?.price)) {
          rateObj.price = mathRound2(Number(rateObj.price));
        } else {
          const globalRatesServiceItem = globalRatesServiceItems.find(
            item => rateObj.lineItemId === item.lineItemId,
          );
          if (!globalRatesServiceItem) {
            throw ApiError.notFound(
              'Global rates for specific billable service customServiceRate not found',
            );
          }
          rateObj.price = mathRound2(Number(globalRatesServiceItem.price));
        }
      });
    }
  }

  Object.assign(ratesObj, {
    customRates: {
      customRatesService,
      customRatesLineItems,
      customRatesServiceItems,
      customRecurringLineItems,
      customRatesSurcharges,
    },
  });

  return ratesObj;
};
