/* eslint-disable padding-line-between-statements */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { format } from 'date-fns';

import { dateFormatsEnUS } from '@root/i18n/format/date';

import { NewUnappliedPayment, PaymentApplication } from '../types';

export const sanitizePaymentApplication = (
  application: PaymentApplication[],
): PaymentApplication[] => {
  return application.map(app => {
    return {
      ...app,
      amount: +(app.amount ?? 0).toFixed(2),
    };
  });
};

export const sanitizePayment = (data: NewUnappliedPayment) => {
  if (data.paymentType === 'creditCard' && data.newCreditCard) {
    const { newCreditCard } = data;

    data.newCreditCard.expirationDate = `${newCreditCard.expirationMonth}${newCreditCard.expirationYear}`;
    data.newCreditCard.cardNumber = newCreditCard.cardNumber.replace(/-/g, '');
    delete data.creditCardId;
    //@ts-expect-error
    delete data.newCreditCard.expirationMonth;
    //@ts-expect-error
    delete data.newCreditCard.expirationYear;
  }
  const applications = sanitizePaymentApplication(
    data.notAppliedInvoices
      .filter(({ checked }) => checked)
      .map(invoice => ({
        invoiceId: invoice.id,
        amount: invoice.amount,
      })),
  );
  //@ts-expect-error
  delete data.notAppliedInvoices;

  if (data.billableItem) {
    delete data.billableItem;
  }

  return {
    ...data,
    applications,
    date: format(data.date, dateFormatsEnUS.ISO),
  };
};
