import httpStatus from 'http-status';

import PermitRepo from '../../../repos/permit.js';

export const getPermitById = async ctx => {
  const { id } = ctx.params;

  const permit = await PermitRepo.getInstance(ctx.state).getById({ id });

  ctx.sendObj(permit);
};

export const getPermits = async ctx => {
  const { excludeExpired, activeOnly } = ctx.request.validated.query;
  const condition = ctx.getRequestCondition();
  activeOnly && (condition.active = true);

  const permits = await PermitRepo.getInstance(ctx.state)[
    excludeExpired ? 'getCurrentPermits' : 'getAll'
  ]({ condition });

  ctx.sendArray(permits);
};

export const createPermit = async ctx => {
  const newPermit = await PermitRepo.getInstance(ctx.state).createOne({
    data: ctx.request.validated.body,
    log: true,
  });

  ctx.status = httpStatus.CREATED;
  ctx.body = newPermit;
};

export const editPermit = async ctx => {
  const { concurrentData } = ctx.state;
  const { id } = ctx.params;

  const updatedPermit = await PermitRepo.getInstance(ctx.state).updateBy({
    condition: { id },
    concurrentData,
    data: ctx.request.validated.body,
    log: true,
  });

  ctx.status = httpStatus.OK;
  ctx.body = updatedPermit;
};

export const deletePermit = async ctx => {
  const { id } = ctx.params;

  await PermitRepo.getInstance(ctx.state).deleteBy({
    condition: { id },
    log: true,
  });

  ctx.status = httpStatus.NO_CONTENT;
};
