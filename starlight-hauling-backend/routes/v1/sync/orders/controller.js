import httpStatus from 'http-status';

import OrderRepo from '../../../../repos/order.js';

import { upsertLoBForOrders } from '../../../../services/billing.js';

import { logger } from '../../../../utils/logger.js';

// eslint-disable-next-line require-await
export const syncOrders = async ctx => {
  const { schemaName, ordersIds } = ctx.request.validated.body;

  const stream = OrderRepo.getInstance(ctx.state, { schemaName }).getStream(ordersIds);

  stream.on('data', async data => {
    const { beforeTaxesTotal, grandTotal } = data;

    const result = {
      ...data,
      beforeTaxesTotal: beforeTaxesTotal ? Number(beforeTaxesTotal) : beforeTaxesTotal,
      grandTotal: grandTotal ? Number(grandTotal) : grandTotal,
    };
    await upsertLoBForOrders(ctx, { data: result, schemaName });
  });

  stream.once('error', err => {
    logger.error(err, `Sync failed. Dropped sync/streaming`);
    stream.destroy();
  });

  ctx.status = httpStatus.OK;
};
