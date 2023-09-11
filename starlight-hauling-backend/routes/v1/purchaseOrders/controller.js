import httpStatus from 'http-status';

import PurchaseOrderRepo from '../../../repos/purchaseOrder.js';

const ITEMS_PER_PAGE = 25;

export const getPurchaseOrders = async ctx => {
  const { skip, limit = ITEMS_PER_PAGE, ...condition } = ctx.request.validated.query;

  const purchaseOrders = await PurchaseOrderRepo.getInstance(ctx.state).getAllPaginated({
    condition,
    skip,
    limit: Math.min(Number(limit), ITEMS_PER_PAGE),
  });

  ctx.sendArray(purchaseOrders);
};

export const getPurchaseOrderById = async ctx => {
  const { id } = ctx.params;

  const purchaseOrder = await PurchaseOrderRepo.getInstance(ctx.state).getById({ id });

  ctx.sendObj(purchaseOrder);
};

export const createPurchaseOrder = async ctx => {
  const newPurchaseOrder = await PurchaseOrderRepo.getInstance(ctx.state).createOne({
    data: { ...ctx.request.validated.body, isOneTime: false },
    log: true,
  });

  newPurchaseOrder.businessLineIds = ctx.request.validated.body.businessLineIds;

  ctx.status = httpStatus.CREATED;
  ctx.body = newPurchaseOrder;
};

export const editPurchaseOrder = async ctx => {
  const { id } = ctx.params;

  const newPurchaseOrder = await PurchaseOrderRepo.getInstance(ctx.state).updateOne({
    data: { id, ...ctx.request.validated.body },
    log: true,
  });

  newPurchaseOrder.businessLineIds = ctx.request.validated.body.businessLineIds;

  ctx.status = httpStatus.CREATED;
  ctx.body = newPurchaseOrder;
};
