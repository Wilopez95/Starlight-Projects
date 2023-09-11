import httpStatus from 'http-status';

import ChangeReasonRepo from '../../../repos/changeReason.js';

export const getChangeReasons = async ctx => {
  const {
    activeOnly = false,
    skip,
    limit,
    sortBy,
    sortOrder,
    ...condition
  } = ctx.request.validated.query;

  const changeReasons = await ChangeReasonRepo.getInstance(ctx.state).getAllPaginated({
    condition,
    activeOnly,
    sortBy,
    sortOrder,
    skip,
    limit,
  });

  ctx.sendArray(changeReasons);
};

export const createChangeReason = async ctx => {
  const data = ctx.request.validated.body;

  const newChangeReason = await ChangeReasonRepo.getInstance(ctx.state).createOne({
    data,
    log: true,
  });

  ctx.status = httpStatus.CREATED;
  ctx.body = newChangeReason;
};

export const updateChangeReason = async ctx => {
  const { id } = ctx.params;
  const data = ctx.request.validated.body;

  const updatedChangeReason = await ChangeReasonRepo.getInstance(ctx.state).updateOne({
    id,
    data,
    log: true,
  });

  updatedChangeReason.businessLineIds = data.businessLineIds;

  ctx.status = httpStatus.OK;
  ctx.body = updatedChangeReason;
};
