import { NewUnappliedPayment, PaymentApplication } from '@root/finance/types/entities';

export const sanitizePayment = (data: NewUnappliedPayment) => {
  if (data.paymentType === 'creditCard' && data.newCreditCard) {
    const { newCreditCard } = data;

    data.newCreditCard.expirationDate = `${newCreditCard.expirationMonth}${newCreditCard.expirationYear}`;
    data.newCreditCard.cardNumber = newCreditCard.cardNumber
      ? newCreditCard.cardNumber.replace(/-/g, '')
      : data.newCreditCard.cardNumber;
    delete data.creditCardId;
    delete data.newCreditCard.expirationMonth;
    delete data.newCreditCard.expirationYear;
  }
  data.applications = sanitizePaymentApplication(data.applications);
  if (data.billableItem) {
    delete data.billableItem;
  }

  return data;
};

export const sanitizePaymentApplication = (
  application: PaymentApplication[],
): PaymentApplication[] => {
  return application.map((app) => {
    return {
      ...app,
      amount: +app.amount.toFixed(2),
    };
  });
};
