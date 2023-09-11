import { nextMonday, startOfToday, addDays } from 'date-fns';
// eslint-disable-next-line import/default
import dateFnsTz from 'date-fns-tz';

import { ensureUtc } from '../../../../../tests/e2e/utils/ensureUtc.js';

import {
  serviceInputCommonFieldsPtDefault,
  deliveryServiceInputPtDefault,
  noneServiceInputPtDefault,
  liveLoadServiceInputPtDefault,
  switchServiceInputPtDefault,
  dumpAndReturnServiceInputPtDefault,
  relocateServiceInputPtDefault,
  finalServiceInputPtDefault,
  orderInputCommonFieldsPtDefault,
  orderInputPaymentPtDefault,
  serviceInputCommonFieldsRoDefault,
  deliveryServiceInputRoDefault,
  generalServiceInputRoDefault,
  noneServiceInputRoDefault,
  liveLoadServiceInputRoDefault,
  repositionServiceInputRoDefault,
  switchServiceInputRoDefault,
  dumpAndReturnServiceInputRoDefault,
  relocateServiceInputRoDefault,
  finalServiceInputRoDefault,
  orderInputCommonFieldsRoDefault,
  orderInputPaymentRoDefault,
} from './common.js';

const { zonedTimeToUtc } = dateFnsTz;
export const newOrderDeliveryPtDate = zonedTimeToUtc(nextMonday(startOfToday()), 'UTC');
export const newOrderNoneServicePtDate = ensureUtc(addDays(newOrderDeliveryPtDate, 1));
export const newOrderLiveLoadPtDate = ensureUtc(addDays(newOrderDeliveryPtDate, 2));
export const newOrderSwitchPtDate = ensureUtc(addDays(newOrderDeliveryPtDate, 3));
export const newOrderDumpAndReturnPtDate = ensureUtc(addDays(newOrderDeliveryPtDate, 4));
export const newOrderRelocatePtDate = ensureUtc(addDays(newOrderDeliveryPtDate, 5));
export const newOrderFinalPtDate = ensureUtc(addDays(newOrderDeliveryPtDate, 6));

export const newOrderDeliveryRoDate = zonedTimeToUtc(nextMonday(startOfToday()), 'UTC');
export const newOrderGeneralServiceRoDate = ensureUtc(addDays(newOrderDeliveryRoDate, 1));
export const newOrderNoneServiceRoDate = ensureUtc(addDays(newOrderDeliveryRoDate, 2));
export const newOrderLiveLoadRoDate = ensureUtc(addDays(newOrderDeliveryRoDate, 3));
export const newOrderSwitchRoDate = ensureUtc(addDays(newOrderDeliveryRoDate, 4));
export const newOrderDumpAndReturnRoDate = ensureUtc(addDays(newOrderDeliveryRoDate, 5));
export const newOrderRelocateRoDate = ensureUtc(addDays(newOrderDeliveryRoDate, 6));
export const newOrderRepositionRoDate = ensureUtc(addDays(newOrderDeliveryRoDate, 7));
export const newOrderFinalRoDate = ensureUtc(addDays(newOrderDeliveryRoDate, 8));

export const newOrdersInputPtDefault = {
  ...orderInputCommonFieldsPtDefault,
  payments: [
    {
      ...orderInputPaymentPtDefault,
      // amount: 99 * 1_000_000,
      amount: 1332 * 1_000_000,
    },
  ],
  orders: [
    // {
    //   ...serviceInputCommonFieldsPtDefault,
    //   ...deliveryServiceInputPtDefault,
    //
    //   billableServiceQuantity: 1,
    //   grandTotal: 99 * 1_000_000,
    //   serviceDate: newOrderDeliveryPtDate.toISOString(),
    // },
    {
      ...serviceInputCommonFieldsPtDefault,
      ...deliveryServiceInputPtDefault,

      billableServiceQuantity: 2,
      grandTotal: 198 * 1_000_000,
      serviceDate: newOrderDeliveryPtDate.toISOString(),
    },
    {
      ...serviceInputCommonFieldsPtDefault,
      ...noneServiceInputPtDefault,

      billableServiceQuantity: 2,
      grandTotal: 400 * 1_000_000,
      serviceDate: newOrderNoneServicePtDate.toISOString(),
    },
    {
      ...serviceInputCommonFieldsPtDefault,
      ...liveLoadServiceInputPtDefault,

      billableServiceQuantity: 2,
      grandTotal: 100 * 1_000_000,
      serviceDate: newOrderLiveLoadPtDate.toISOString(),
    },
    {
      ...serviceInputCommonFieldsPtDefault,
      ...switchServiceInputPtDefault,

      billableServiceQuantity: 2,
      grandTotal: 200 * 1_000_000,
      serviceDate: newOrderSwitchPtDate.toISOString(),
    },
    {
      ...serviceInputCommonFieldsPtDefault,
      ...dumpAndReturnServiceInputPtDefault,

      billableServiceQuantity: 2,
      grandTotal: 176 * 1_000_000,
      serviceDate: newOrderDumpAndReturnPtDate.toISOString(),
    },
    {
      ...serviceInputCommonFieldsPtDefault,
      ...relocateServiceInputPtDefault,

      billableServiceQuantity: 2,
      grandTotal: 60 * 1_000_000,
      serviceDate: newOrderRelocatePtDate.toISOString(),
    },
    {
      ...serviceInputCommonFieldsPtDefault,
      ...finalServiceInputPtDefault,

      billableServiceQuantity: 2,
      grandTotal: 198 * 1_000_000,
      serviceDate: newOrderFinalPtDate.toISOString(),
    },
  ],
};

export const newOrdersInputRoDefault = {
  ...orderInputCommonFieldsRoDefault,
  payments: [
    {
      ...orderInputPaymentRoDefault,
      // amount: 106 * 1_000_000,
      amount: 808 * 1_000_000,
    },
  ],
  orders: [
    // {
    //   ...serviceInputCommonFieldsRoDefault,
    //   ...deliveryServiceInputRoDefault,
    //
    //   billableServiceQuantity: 1,
    //   grandTotal: 106 * 1_000_000,
    //   serviceDate: newOrderDeliveryRoDate.toISOString(),
    // },
    {
      ...serviceInputCommonFieldsRoDefault,
      ...deliveryServiceInputRoDefault,

      billableServiceQuantity: 2,
      grandTotal: 212 * 1_000_000,
      serviceDate: newOrderDeliveryRoDate.toISOString(),
    },
    {
      ...serviceInputCommonFieldsRoDefault,
      ...generalServiceInputRoDefault,

      billableServiceQuantity: 2,
      grandTotal: 58 * 1_000_000,
      serviceDate: newOrderGeneralServiceRoDate.toISOString(),
    },
    {
      ...serviceInputCommonFieldsRoDefault,
      ...noneServiceInputRoDefault,

      billableServiceQuantity: 2,
      grandTotal: 80 * 1_000_000,
      serviceDate: newOrderNoneServiceRoDate.toISOString(),
    },
    {
      ...serviceInputCommonFieldsRoDefault,
      ...liveLoadServiceInputRoDefault,

      billableServiceQuantity: 2,
      grandTotal: 58 * 1_000_000,
      serviceDate: newOrderLiveLoadRoDate.toISOString(),
    },
    {
      ...serviceInputCommonFieldsRoDefault,
      ...switchServiceInputRoDefault,

      billableServiceQuantity: 2,
      grandTotal: 102 * 1_000_000,
      serviceDate: newOrderSwitchRoDate.toISOString(),
    },
    {
      ...serviceInputCommonFieldsRoDefault,
      ...dumpAndReturnServiceInputRoDefault,

      billableServiceQuantity: 2,
      grandTotal: 80 * 1_000_000,
      serviceDate: newOrderDumpAndReturnRoDate.toISOString(),
    },
    {
      ...serviceInputCommonFieldsRoDefault,
      ...relocateServiceInputRoDefault,
      jobSite2Label: 'Denver Water, Denver, CO, 80226',
      jobSite2Id: 46,

      billableServiceQuantity: 2,
      grandTotal: 58 * 1_000_000,
      serviceDate: newOrderRelocateRoDate.toISOString(),
    },
    {
      ...serviceInputCommonFieldsRoDefault,
      ...repositionServiceInputRoDefault,

      billableServiceQuantity: 2,
      grandTotal: 80 * 1_000_000,
      serviceDate: newOrderRepositionRoDate.toISOString(),
    },
    {
      ...serviceInputCommonFieldsRoDefault,
      ...finalServiceInputRoDefault,

      billableServiceQuantity: 2,
      grandTotal: 80 * 1_000_000,
      serviceDate: newOrderFinalRoDate.toISOString(),
    },
  ],
};

export const newPtDeliveryOrderInputDefault = {
  ...orderInputCommonFieldsPtDefault,
  payments: [
    {
      ...orderInputPaymentPtDefault,
      amount: 99 * 1_000_000,
    },
  ],
  orders: [
    {
      ...serviceInputCommonFieldsPtDefault,
      ...deliveryServiceInputPtDefault,

      billableServiceQuantity: 1,
      grandTotal: 99 * 1_000_000,
      serviceDate: newOrderDeliveryPtDate.toISOString(),
    },
  ],
};

export const newRoDeliveryOrderInputDefault = {
  ...orderInputCommonFieldsRoDefault,
  payments: [
    {
      ...orderInputPaymentRoDefault,
      amount: 106 * 1_000_000,
    },
  ],
  orders: [
    {
      ...serviceInputCommonFieldsRoDefault,
      ...deliveryServiceInputRoDefault,

      billableServiceQuantity: 1,
      grandTotal: 106 * 1_000_000,
      serviceDate: newOrderDeliveryRoDate.toISOString(),
    },
  ],
};
