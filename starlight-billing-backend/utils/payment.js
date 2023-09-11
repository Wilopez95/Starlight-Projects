import ApplicationError from '../errors/ApplicationError.js';

//import { AUTHORIZATION_AMOUNT } from '../config.js'; Commented in context of PRODSUP-160

import { PaymentStatus } from '../consts/paymentStatus.js';
import { PaymentType } from '../consts/paymentTypes.js';
import { mathRound2, calculateGcd } from './math.js';

export const getPaymentStatus = ({ deferred, ccInitialRetref, isCreditCard }) => {
  if (deferred) {
    return PaymentStatus.DEFERRED;
  }

  if (isCreditCard && !ccInitialRetref) {
    return PaymentStatus.FAILED;
  }

  return PaymentStatus.CAPTURED;
};

export const getPaymentsData = ({
  date,
  deferred,
  deferredUntil,
  amount,
  ccInitialRetref,
  //ccAuthorizationRetref, Commented in context of PRODSUP-160
  //skipAuthorization, Commented in context of PRODSUP-160
  orders,
  ...commonData
}) => {
  const isCreditCard = commonData.paymentType === PaymentType.CREDIT_CARD;
  const paymentsData = [
    {
      ...commonData,

      date: date.toUTCString(),
      deferredUntil: deferredUntil?.toUTCString(),

      ccRetref: ccInitialRetref,
      status: getPaymentStatus({ deferred, ccInitialRetref, isCreditCard }),
      orders,
      amount,
      appliedAmount: 0,
    },
  ];

  /*if (isCreditCard && !skipAuthorization && !deferred && AUTHORIZATION_AMOUNT > 0) {
    paymentsData.push({
      ...commonData,
      date: date.toUTCString(),

      status: ccAuthorizationRetref ? PaymentStatus.AUTHORIZED : PaymentStatus.FAILED,
      ccRetref: ccAuthorizationRetref,
      orders: orders.map((order) => ({ id: order.id, assignedAmount: 0 })),
      amount: AUTHORIZATION_AMOUNT,
      appliedAmount: 0,
    });
  }*/

  return paymentsData;
};

export const splitPaymentAmount = (orders, payment) => {
  // gcd used here to split amounts proportionally between orders
  const gcd = calculateGcd(orders.map(order => order.capturedTotal));

  const ratio = orders.map(order => order.grandTotal / gcd);
  const totalRatio = ratio.reduce((acc, cur) => acc + cur, 0);

  let remainingAmount = payment.amount;

  payment.orders = orders.map(({ id }, index) => {
    const assignedAmount = mathRound2(
      index === orders.length - 1 ? remainingAmount : (ratio[index] / totalRatio) * payment.amount,
    );

    remainingAmount = mathRound2(remainingAmount - assignedAmount);

    return {
      id,
      assignedAmount,
    };
  });

  return payment;
};

export const checkCcDataPresence = ({ paymentType, creditCardId, newCreditCard }) => {
  if (paymentType === PaymentType.CREDIT_CARD && !creditCardId && !newCreditCard) {
    throw ApplicationError.invalidRequest(
      'Payment type credit card was selected, but no credit card was provided',
    );
  }
};

export const shouldBeIncludedInBankDeposit = paymentType =>
  [PaymentType.CHECK, PaymentType.CASH].includes(paymentType);
