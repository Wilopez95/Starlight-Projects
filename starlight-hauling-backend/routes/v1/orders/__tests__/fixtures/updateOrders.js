import { addDays } from 'date-fns';

import { ensureUtc } from '../../../../../tests/e2e/utils/ensureUtc.js';

import { ORDER_STATUS } from '../../../../../consts/orderStatuses.js';
import {
  deliveryServiceInputPtDefault,
  orderInputCommonFieldsPtDefault,
  orderInputPaymentPtDefault,
  serviceInputCommonFieldsPtDefault,
  updatedPtDeliveryOrderInputDefault,
  deliveryServiceInputRoDefault,
  orderInputCommonFieldsRoDefault,
  orderInputPaymentRoDefault,
  serviceInputCommonFieldsRoDefault,
  updatedRoDeliveryOrderInputDefault,
} from './common.js';
import { newOrderDeliveryPtDate, newOrderDeliveryRoDate } from './addOrders.js';

export const updatedPtOrderDate = ensureUtc(addDays(newOrderDeliveryPtDate, 2));
export const updatedRoOrderDate = ensureUtc(addDays(newOrderDeliveryRoDate, 2));

export const newPtDeliveryOrderToUpdateInputDefault = {
  ...orderInputCommonFieldsPtDefault,
  payments: [
    {
      ...orderInputPaymentPtDefault,
      amount: 99,
    },
  ],
  orders: [
    {
      ...serviceInputCommonFieldsPtDefault,
      ...deliveryServiceInputPtDefault,

      billableServiceQuantity: 1,
      grandTotal: 99,
      serviceDate: newOrderDeliveryPtDate.toISOString(),
    },
  ],
};

export const updatedPtOrderInputDefault = {
  ...updatedPtDeliveryOrderInputDefault,

  applySurcharges: true,
  status: ORDER_STATUS.inProgress,
  serviceDate: updatedPtOrderDate.toISOString(),
  route: null,
  // "lineItems":[],
  // "thresholds":[],
};

export const newRoDeliveryOrderToUpdateInputDefault = {
  ...orderInputCommonFieldsRoDefault,
  payments: [
    {
      ...orderInputPaymentRoDefault,
      amount: 106,
    },
  ],
  orders: [
    {
      ...serviceInputCommonFieldsRoDefault,
      ...deliveryServiceInputRoDefault,

      billableServiceQuantity: 1,
      grandTotal: 106,
      serviceDate: newOrderDeliveryRoDate.toISOString(),
    },
  ],
};

export const updatedRoOrderInputDefault = {
  ...updatedRoDeliveryOrderInputDefault,

  applySurcharges: true,
  status: ORDER_STATUS.inProgress,
  serviceDate: updatedRoOrderDate.toISOString(),
  route: null,
  // "lineItems":[],
  // "thresholds":[],
};
