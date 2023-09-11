import { getAvailableCredit } from '../billing.js';

import CustomerRepo from '../../repos/customer.js';

import { checkPermissions } from '../../middlewares/authorized.js';

import ApiError from '../../errors/ApiError.js';

import { PAYMENT_METHOD } from '../../consts/paymentMethods.js';

export const checkCreditLimit = async (ctx, { order, updateData }, trx) => {
  if (order.paymentMethod !== PAYMENT_METHOD.onAccount) {
    return;
  }

  if (
    updateData.overrideCreditLimit &&
    !checkPermissions(ctx.state.user, ['orders:override-credit-limit:perform'])
  ) {
    throw ApiError.accessDenied('You do not have permission to override credit limit');
  }

  const { schemaName } = ctx.state.user;

  const customer = await CustomerRepo.getHistoricalInstance(ctx.state, {
    schemaName,
  }).getBy(
    {
      id: order.customerId,
    },
    trx,
  );

  if (!customer.onAccount || order.overrideCreditLimit || updateData.overrideCreditLimit) {
    return;
  }

  const { availableCredit } = await getAvailableCredit(ctx, {
    customerId: customer.originalId,
  });

  if (updateData.grandTotal > 0 && availableCredit < updateData.grandTotal - order.grandTotal) {
    throw ApiError.paymentRequired('Credit limit exceeded');
  }
};
