import { camelCase } from 'lodash-es';

import { convertDates, substituteLocalTimeZoneInsteadUTC } from '@root/helpers';
import {
  type ManuallyCreatablePayment,
  type PaymentType,
} from '@root/modules/billing/Payments/types';
import { JsonConversions } from '@root/types';

export const mapPayment = (payment: JsonConversions<ManuallyCreatablePayment>) => {
  const mappedPayment = convertDates(payment);

  mappedPayment.paymentType = camelCase(mappedPayment.paymentType) as PaymentType;
  mappedPayment.date = substituteLocalTimeZoneInsteadUTC(mappedPayment.date);

  return mappedPayment;
};
