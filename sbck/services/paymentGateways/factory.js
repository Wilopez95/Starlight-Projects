import pick from 'lodash/pick.js';

import { PaymentGateway } from '../../consts/paymentGateways.js';

import { CardConnect } from './cardconnect.js';
import { FluidPay } from './fluidpay.js';

export const getPaymentGateway = (ctx, { paymentGateway, ...merchant }) => {
  const data = merchant.spUsed
    ? {
        mid: merchant.salespointMid,
        username: merchant.salespointUsername,
        password: merchant.salespointPassword,
      }
    : pick(merchant, ['mid', 'username', 'password']);

  try {
    if (paymentGateway === PaymentGateway.CARDCONNECT) {
      return new CardConnect(ctx, data);
    } else if (paymentGateway === PaymentGateway.FLUIDPAY) {
      return new FluidPay(ctx, data);
    }

    throw new Error('Unsupported payment gateway type');
  } catch (error) {
    ctx.logger.error(error);

    throw error;
  }
};
