import { type IConfigurableOrder, type IEntity, type IOrderLineItem } from '@root/types';

export const defaultLineItem: Omit<IOrderLineItem, keyof IEntity> = {
  billableLineItemId: 1,
  quantity: 1,
  units: undefined,
  customRatesGroupLineItemsId: undefined,
  globalRatesLineItemsId: undefined,
  price: 0,
  applySurcharges: true,
};

export const checkDeferredPaymentAllowed = (values: IConfigurableOrder) =>
  !values.noBillableService &&
  !!values.serviceDate &&
  values.deferred &&
  values.payments.some(
    payment =>
      payment.paymentType === 'creditCard' &&
      (payment.status === 'deferred' || payment.status === 'failed') &&
      payment.deferredUntil,
  );
