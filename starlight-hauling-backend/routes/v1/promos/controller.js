import httpStatus from 'http-status';

import PromoRepo from '../../../repos/promo.js';

export const getPromoById = async ctx => {
  const { id } = ctx.params;

  const promo = await PromoRepo.getInstance(ctx.state).getById({ id });

  ctx.sendObj(promo);
};

export const getPromos = async ctx => {
  const { excludeExpired, activeOnly } = ctx.request.query;
  const condition = ctx.getRequestCondition();
  activeOnly && (condition.active = true);

  const promos = await PromoRepo.getInstance(ctx.state)[
    excludeExpired ? 'getCurrentPromos' : 'getAll'
  ]({ condition });

  ctx.sendArray(promos);
};

export const createPromo = async ctx => {
  const data = ctx.request.validated.body;

  const newPromo = await PromoRepo.getInstance(ctx.state).createOne({
    data,
    log: true,
  });

  ctx.status = httpStatus.CREATED;
  ctx.body = newPromo;
};

export const editPromo = async ctx => {
  const { concurrentData } = ctx.state;
  const { id } = ctx.params;

  const updatedPromo = await PromoRepo.getInstance(ctx.state).updateBy({
    condition: { id },
    concurrentData,
    data: ctx.request.validated.body,
    log: true,
  });

  ctx.sendObj(updatedPromo);
};

export const deletePromo = async ctx => {
  const { id } = ctx.params;

  await PromoRepo.getInstance(ctx.state).deleteBy({ condition: { id }, log: true });

  ctx.status = httpStatus.NO_CONTENT;
};
