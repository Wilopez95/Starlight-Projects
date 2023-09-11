import isEmpty from 'lodash/isEmpty.js';
import map from 'lodash/map.js';
import xor from 'lodash/xor.js';
import sortBy from 'lodash/sortBy.js';
import {
  differenceInCalendarDays,
  addWeeks,
  addMonths,
  getDaysInMonth,
  setDay,
  addDays,
  lastDayOfMonth,
  setDate,
  isBefore,
} from 'date-fns';
// eslint-disable-next-line import/default
import dateFnsTz from 'date-fns-tz';

import BaseRepository from '../repos/_base.js';
import MaterialRepository from '../repos/material.js';
import BillableServiceRepository from '../repos/billableService.js';
import RecurrentOrderTemplateRepo from '../repos/recurrentOrderTemplate.js';
import GlobalRatesServiceRepo from '../repos/globalRatesService.js';
import GlobalRatesLineItemRepo from '../repos/globalRatesLineItem.js';
import CustomRatesGroupRepo from '../repos/customRatesGroup.js';
import CustomGroupRatesServiceRepo from '../repos/customRatesGroupService.js';
import CustomGroupRatesLineItemRepo from '../repos/customRatesGroupLineItem.js';
import BillableLineItemRepository from '../repos/billableLineItem.js';

import { mathRound2 } from '../utils/math.js';

import ApiError from '../errors/ApiError.js';

import {
  RECURRENT_TEMPLATE_FREQUENCY_TYPE,
  RECURRENT_TEMPLATE_CUSTOM_FREQUENCY_TYPE,
} from '../consts/recurrentOrderTemplates.js';
import EquipmentItemRepository from '../repos/equipmentItem.js';
import { calcRates } from './orderRates.js';

const { zonedTimeToUtc, utcToZonedTime } = dateFnsTz;
const validateRates = ({ serviceRate, lineItemsRates, lineItems }) => {
  let serviceRateValid;
  let lineItemsRatesValid;

  if (!isEmpty(serviceRate)) {
    const servicePrice = Number(serviceRate.price);

    if (servicePrice > 0) {
      serviceRateValid = true;
    }
  }

  if (isEmpty(lineItems)) {
    lineItemsRatesValid = true;
  } else if (
    !isEmpty(lineItemsRates) &&
    isEmpty(
      xor(map(lineItems, 'billableLineItem.originalId'), map(lineItemsRates, 'lineItemId')),
    ) &&
    lineItemsRates.every(rate => Number(rate.price) > 0)
  ) {
    lineItemsRatesValid = true;
  }

  return serviceRateValid && lineItemsRatesValid;
};

const getHistoricalRatesData = async (
  { type, customRatesGroupId, serviceRateId, lineItemsRateIds, materialId, billableServiceId },
  schemaName,
  trx,
) => {
  const [
    historicalRatesGroup,
    historicalServiceRate,
    historicalLineItems,
    historicalMaterial,
    historicalService,
  ] = await Promise.all([
    type === 'custom'
      ? BaseRepository.getNewestHistoricalRecord(
          {
            tableName: CustomRatesGroupRepo.TABLE_NAME,
            schemaName,
            condition: {
              originalId: customRatesGroupId,
            },
          },
          trx,
        )
      : Promise.resolve(),
    BaseRepository.getNewestHistoricalRecord(
      {
        tableName:
          type === 'custom'
            ? CustomGroupRatesServiceRepo.TABLE_NAME
            : GlobalRatesServiceRepo.TABLE_NAME,
        schemaName,
        condition: {
          originalId: serviceRateId,
        },
      },
      trx,
    ),
    BaseRepository.getNewestHistoricalRecords(
      {
        tableName:
          type === 'custom'
            ? CustomGroupRatesLineItemRepo.TABLE_NAME
            : GlobalRatesLineItemRepo.TABLE_NAME,
        schemaName,
        originalIds: lineItemsRateIds,
        fields: ['id', 'originalId'],
      },
      trx,
    ),
    BaseRepository.getNewestHistoricalRecord(
      {
        tableName: MaterialRepository.TABLE_NAME,
        schemaName,
        condition: {
          originalId: materialId,
        },
      },
      trx,
    ),
    BaseRepository.getNewestHistoricalRecord(
      {
        tableName: BillableServiceRepository.TABLE_NAME,
        schemaName,
        condition: {
          originalId: billableServiceId,
        },
      },
      trx,
    ),
  ]);

  return {
    historicalRatesGroup,
    historicalServiceRate,
    historicalLineItems,
    historicalMaterial,
    historicalService,
  };
};

export const getNewestRatesForRecurrentOrderTemplate = async (
  { recurrentOrderTemplateId },
  ctxState,
  trx,
) => {
  const recurrentOrderTemplate = await RecurrentOrderTemplateRepo.getInstance(ctxState).getBy(
    {
      condition: { id: recurrentOrderTemplateId },
      fields: [
        'id',
        'businessUnitId',
        'businessLineId',
        'billableServicePrice',
        'billableServiceTotal',
        'billableServiceId',
        'equipmentItemId',
        'materialId',
        'lineItems',
        'customRatesGroupId',
      ],
    },
    trx,
  );

  if (!recurrentOrderTemplate) {
    throw ApiError.notFound(`Recurrent order with id ${recurrentOrderTemplate} not found`);
  }

  const {
    customRatesGroup,
    billableService,
    equipmentItem,
    material,
    businessUnit: { id: businessUnitId },
    businessLine: { id: businessLineId },
  } = recurrentOrderTemplate;
  const [nonHistoricalBillableService, nonHistoricalBillableLineItems] = await Promise.all([
    BillableServiceRepository.getInstance(ctxState).getById(
      { id: billableService?.originalId, fields: 'materialBasedPricing' },
      trx,
    ),
    BillableLineItemRepository.getInstance(ctxState).getByIds(
      {
        ids: recurrentOrderTemplate?.lineItems?.map(element => element.billableLineItem.originalId),
        fields: ['materialBasedPricing', 'id'],
      },
      trx,
    ),
  ]);

  const ratesObj = await calcRates(
    ctxState,
    {
      businessUnitId,
      businessLineId,

      type: customRatesGroup ? 'custom' : 'global',
      customRatesGroupId: customRatesGroup?.originalId,

      billableService: {
        billableServiceId: billableService?.originalId,
        equipmentItemId: equipmentItem?.originalId,
        materialId: nonHistoricalBillableService?.materialBasedPricing
          ? material?.originalId
          : null,
      },
      billableLineItems: recurrentOrderTemplate?.lineItems?.map(
        ({ billableLineItem, material: liMaterial }) => ({
          lineItemId: billableLineItem.originalId,
          materialId: nonHistoricalBillableLineItems?.find(
            ({ id }) => id === billableLineItem.originalId,
          )?.materialBasedPricing
            ? liMaterial?.originalId
            : null,
        }),
      ),
    },
    trx,
  );

  const serviceRate = customRatesGroup
    ? ratesObj?.customRates?.customRatesService
    : ratesObj?.globalRates?.globalRatesService;

  const lineItemsRates = customRatesGroup
    ? ratesObj?.customRates?.customRatesLineItems
    : ratesObj?.globalRates?.globalRatesLineItems;

  if (validateRates({ serviceRate, lineItemsRates, lineItems: recurrentOrderTemplate.lineItems })) {
    const {
      historicalRatesGroup,
      historicalServiceRate,
      historicalLineItems,
      historicalMaterial,
      historicalService,
    } = await getHistoricalRatesData(
      {
        type: customRatesGroup ? 'custom' : 'global',
        customRatesGroupId: customRatesGroup?.originalId,
        serviceRateId: serviceRate.id,
        lineItemsRateIds: map(lineItemsRates, 'id'),
        materialId: material.originalId,
        billableServiceId: billableService.originalId,
      },
      ctxState.user.schemaName,
      trx,
    );

    const newServicePrice = Number(serviceRate.price);

    const pricesUpdateData = {
      billableServicePrice: newServicePrice,
      billableServiceTotal: newServicePrice,
      customRatesGroupId: historicalRatesGroup?.id,
      materialId: historicalMaterial.id,
      billableServiceId: historicalService.id,
      [customRatesGroup ? 'customRatesGroupServicesId' : 'globalRatesServicesId']:
        historicalServiceRate.id,
    };

    let billableLineItemsTotal = 0;

    const lineItemsUpdateData = isEmpty(recurrentOrderTemplate?.lineItems)
      ? []
      : recurrentOrderTemplate.lineItems.map(lineItem => {
          const rate = lineItemsRates.find(
            ({ lineItemId }) => lineItemId === lineItem.billableLineItem.originalId,
          );

          const historicalRateId = historicalLineItems.find(
            ({ originalId }) => rate.id === originalId,
          )?.id;

          billableLineItemsTotal += Number(lineItem.quantity) * Number(rate.price);

          return {
            id: lineItem.id,
            recurrentOrderTemplateId,
            billableLineItemId: lineItem.billableLineItemId,
            quantity: lineItem.quantity,
            price: rate.price,
            [customRatesGroup ? 'customRatesGroupLineItemsId' : 'globalRatesLineItemsId']:
              historicalRateId,
          };
        });
    // pricing service code
    pricesUpdateData.billableLineItemsTotal = billableLineItemsTotal;
    pricesUpdateData.beforeTaxesTotal = mathRound2(billableLineItemsTotal + newServicePrice);

    return { pricesUpdateData, lineItemsUpdateData };
  }

  return null;
};
export const getNewestRatesForRecurrentOrderTemplatePricing = async (
  recurrentOrderTemplateData,
  ctxState,
  trx,
) => {
  // const recurrentOrderTemplate = await RecurrentOrderTemplateRepo.getInstance(ctxState).getBy(
  //   {
  //     condition: { id: 34 },
  //     fields: [
  //       'id',
  //       'businessUnitId',
  //       'businessLineId',
  //       'billableServicePrice',
  //       'billableServiceTotal',
  //       'billableServiceId',
  //       'equipmentItemId',
  //       'materialId',
  //       'lineItems',
  //       'customRatesGroupId',
  //     ],
  //   },
  //   trx,
  // );
  const recurrentOrderTemplate = recurrentOrderTemplateData;

  if (!recurrentOrderTemplate) {
    throw ApiError.notFound(`Recurrent order with id ${recurrentOrderTemplate} not found`);
  }

  const billableServiceData = await BillableServiceRepository.getHistoricalInstance(ctxState).getBy(
    {
      condition: { id: recurrentOrderTemplate.billableServiceId },
    },
  );

  const customRatesGroupData = await CustomRatesGroupRepo.getHistoricalInstance(ctxState).getBy({
    condition: { id: recurrentOrderTemplate.customRatesGroupId },
  });

  const equipmentItemData = await EquipmentItemRepository.getHistoricalInstance(ctxState).getBy({
    condition: { id: recurrentOrderTemplate.equipmentItemId },
  });

  const materialData = await MaterialRepository.getHistoricalInstance(ctxState).getBy({
    condition: { id: recurrentOrderTemplate.materialId },
  });

  recurrentOrderTemplate.customRatesGroup = customRatesGroupData;
  recurrentOrderTemplate.billableService = billableServiceData;
  recurrentOrderTemplate.equipmentItem = equipmentItemData;
  recurrentOrderTemplate.material = materialData;

  for (let index = 0; index < recurrentOrderTemplate.lineItems.length; index++) {
    const billableLineItemData = await BillableLineItemRepository.getHistoricalInstance(
      ctxState,
    ).getBy({
      condition: { id: recurrentOrderTemplate.lineItems[index].billableLineItemId },
    });
    const materialDatas = await MaterialRepository.getHistoricalInstance(ctxState).getBy({
      condition: { id: recurrentOrderTemplate.lineItems[index].materialId },
    });
    const globalRatesLineItemDate = await GlobalRatesLineItemRepo.getHistoricalInstance(
      ctxState,
    ).getBy({
      condition: { id: recurrentOrderTemplate.lineItems[index].globalRatesLineItemsId },
    });

    recurrentOrderTemplate.lineItems[index].billableLineItem = billableLineItemData;
    recurrentOrderTemplate.lineItems[index].material = materialDatas;
    recurrentOrderTemplate.lineItems[index].globalRatesLineItem = globalRatesLineItemDate;
  }

  const {
    customRatesGroup,
    billableService,
    equipmentItem,
    material,
    businessUnitId,
    businessLineId,
  } = recurrentOrderTemplate;

  const [nonHistoricalBillableService, nonHistoricalBillableLineItems] = await Promise.all([
    BillableServiceRepository.getInstance(ctxState).getById(
      { id: billableService?.originalId, fields: 'materialBasedPricing' },
      trx,
    ),
    BillableLineItemRepository.getInstance(ctxState).getByIds(
      {
        ids: recurrentOrderTemplate?.lineItems?.map(element => element.billableLineItem.originalId),
        fields: ['materialBasedPricing', 'id'],
      },
      trx,
    ),
  ]);

  const ratesObj = await calcRates(
    ctxState,
    {
      businessUnitId,
      businessLineId,

      type: customRatesGroup ? 'custom' : 'global',
      customRatesGroupId: customRatesGroup?.originalId,

      billableService: {
        billableServiceId: billableService?.originalId,
        equipmentItemId: equipmentItem?.originalId,
        materialId: nonHistoricalBillableService?.materialBasedPricing
          ? material?.originalId
          : null,
      },
      billableLineItems: recurrentOrderTemplate?.lineItems?.map(
        ({ billableLineItem, material: liMaterial }) => ({
          lineItemId: billableLineItem.originalId,
          materialId: nonHistoricalBillableLineItems?.find(
            ({ id }) => id === billableLineItem.originalId,
          )?.materialBasedPricing
            ? liMaterial?.originalId
            : null,
        }),
      ),
    },
    trx,
  );

  const serviceRate = customRatesGroup
    ? ratesObj?.customRates?.customRatesService
    : ratesObj?.globalRates?.globalRatesService;

  const lineItemsRates = customRatesGroup
    ? ratesObj?.customRates?.customRatesLineItems
    : ratesObj?.globalRates?.globalRatesLineItems;

  if (validateRates({ serviceRate, lineItemsRates, lineItems: recurrentOrderTemplate.lineItems })) {
    const {
      historicalRatesGroup,
      historicalServiceRate,
      historicalLineItems,
      historicalMaterial,
      historicalService,
    } = await getHistoricalRatesData(
      {
        type: customRatesGroup ? 'custom' : 'global',
        customRatesGroupId: customRatesGroup?.originalId,
        serviceRateId: serviceRate.id,
        lineItemsRateIds: map(lineItemsRates, 'id'),
        materialId: material.originalId,
        billableServiceId: billableService.originalId,
      },
      ctxState.user.schemaName,
      trx,
    );

    const newServicePrice = Number(serviceRate.price);

    const pricesUpdateData = {
      billableServicePrice: newServicePrice,
      billableServiceTotal: newServicePrice,
      customRatesGroupId: historicalRatesGroup?.id,
      materialId: historicalMaterial.id,
      billableServiceId: historicalService.id,
      [customRatesGroup ? 'customRatesGroupServicesId' : 'globalRatesServicesId']:
        historicalServiceRate.id,
    };

    let billableLineItemsTotal = 0;

    const lineItemsUpdateData = isEmpty(recurrentOrderTemplate?.lineItems)
      ? []
      : recurrentOrderTemplate.lineItems.map(lineItem => {
          const rate = lineItemsRates.find(
            ({ lineItemId }) => lineItemId === lineItem.billableLineItem.originalId,
          );

          const historicalRateId = historicalLineItems.find(
            ({ originalId }) => rate.id === originalId,
          )?.id;

          billableLineItemsTotal += Number(lineItem.quantity) * Number(rate.price);

          return {
            id: lineItem.id,
            recurrentOrderTemplateId: recurrentOrderTemplate.Id,
            billableLineItemId: lineItem.billableLineItemId,
            quantity: lineItem.quantity,
            price: rate.price,
            [customRatesGroup ? 'customRatesGroupLineItemsId' : 'globalRatesLineItemsId']:
              historicalRateId,
          };
        });

    pricesUpdateData.billableLineItemsTotal = billableLineItemsTotal;
    pricesUpdateData.beforeTaxesTotal = mathRound2(billableLineItemsTotal + newServicePrice);

    return { pricesUpdateData, lineItemsUpdateData };
  }

  return null;
};

export const validateDates = ({ startDate, endDate, initialServiceDate, deliveryServiceDate }) => {
  const utcStartDate = zonedTimeToUtc(startDate, 'UTC');
  const utcEndDate = endDate && zonedTimeToUtc(endDate, 'UTC');
  const utcDeliveryDate = deliveryServiceDate && zonedTimeToUtc(deliveryServiceDate, 'UTC');
  const utcInitialServiceDate = zonedTimeToUtc(initialServiceDate, 'UTC');

  if (differenceInCalendarDays(utcStartDate, new Date()) < 0 && deliveryServiceDate) {
    throw ApiError.invalidRequest(
      'Delivery order cannot be created if recurrent template start date is in the past',
    );
  }

  if (deliveryServiceDate && differenceInCalendarDays(utcDeliveryDate, new Date()) < 0) {
    throw ApiError.invalidRequest('Delivery order service date cannot be past date');
  }

  if (endDate && differenceInCalendarDays(utcEndDate, utcStartDate) <= 1) {
    throw ApiError.invalidRequest('Recurrent template period is equal or lower than 1');
  }

  if (endDate && differenceInCalendarDays(utcInitialServiceDate, utcEndDate) > 0) {
    throw ApiError.invalidRequest('Initial service date is after end date');
  }
};

const getNextServiceDateForCustomFrequency = (
  { startDate, customFrequencyType, frequencyPeriod, frequencyDays },
  isInitialSetup,
) => {
  const nextWeekDate = addWeeks(startDate, frequencyPeriod);
  const nextMonthDate = addMonths(startDate, frequencyPeriod);
  const daysCount = getDaysInMonth(nextMonthDate);

  const minDay =
    customFrequencyType === RECURRENT_TEMPLATE_CUSTOM_FREQUENCY_TYPE.weekly &&
    Math.min(...frequencyDays);

  const closestWeekDay = sortBy(frequencyDays).find(
    day => differenceInCalendarDays(setDay(startDate, day), startDate) > 0,
  );

  let nextServiceDate;

  switch (customFrequencyType) {
    case RECURRENT_TEMPLATE_CUSTOM_FREQUENCY_TYPE.daily:
      nextServiceDate = addDays(startDate, frequencyPeriod);
      break;
    case RECURRENT_TEMPLATE_CUSTOM_FREQUENCY_TYPE.weekly:
      if (isInitialSetup) {
        nextServiceDate = setDay(nextWeekDate, minDay);
      } else {
        nextServiceDate = closestWeekDay
          ? setDay(startDate, closestWeekDay)
          : setDay(nextWeekDate, minDay);
      }
      break;
    case RECURRENT_TEMPLATE_CUSTOM_FREQUENCY_TYPE.monthly:
      if (frequencyDays[0] > daysCount) {
        nextServiceDate = lastDayOfMonth(nextMonthDate);
      } else {
        nextServiceDate = setDate(nextMonthDate, frequencyDays[0]);
      }
      break;
    default:
      throw new TypeError('Invalid frequency type');
  }

  return nextServiceDate;
};

export const getNextServiceDate = (
  {
    date,
    endDate,
    frequencyType,
    customFrequencyType,
    frequencyPeriod,
    frequencyDays,
    timeZone = 'UTC',
  },
  isInitialSetup = false,
) => {
  const orderDate = date;
  const buDate = utcToZonedTime(new Date(), timeZone);

  if (isInitialSetup && differenceInCalendarDays(orderDate, buDate) > -1) {
    return orderDate;
  }
  const startDate = isBefore(orderDate, buDate) ? buDate : orderDate;

  let nextServiceDate;

  switch (frequencyType) {
    case RECURRENT_TEMPLATE_FREQUENCY_TYPE.daily:
      nextServiceDate = addDays(startDate, 1);
      break;
    case RECURRENT_TEMPLATE_FREQUENCY_TYPE.weekly:
      nextServiceDate = addDays(startDate, 7);
      break;
    case RECURRENT_TEMPLATE_FREQUENCY_TYPE.monthly:
      nextServiceDate = addMonths(startDate, 1);
      break;
    case RECURRENT_TEMPLATE_FREQUENCY_TYPE.custom:
      nextServiceDate = getNextServiceDateForCustomFrequency(
        {
          startDate,
          customFrequencyType,
          frequencyPeriod,
          frequencyDays,
        },
        isInitialSetup,
      );
      break;
    default:
      throw new TypeError('Invalid frequency type');
  }

  if (endDate && differenceInCalendarDays(nextServiceDate, zonedTimeToUtc(endDate, 'UTC')) > 0) {
    return null;
  }

  return nextServiceDate;
};
