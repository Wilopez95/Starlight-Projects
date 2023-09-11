import httpStatus from 'http-status';

import OriginRepository from '../../../repos/origin.js';
import { SORT_ORDER } from '../../../consts/sortOrders.js';

const ITEMS_PER_PAGE = 25;

export const getOrigins = async ctx => {
  const {
    activeOnly = false,
    skip = 0,
    limit = ITEMS_PER_PAGE,
    sortOrder = SORT_ORDER.desc,
    sortBy,
  } = ctx.request.query;

  const condition = {
    filters: { filterByBusinessUnits: ctx.request.validated.query.filterByBusinessUnits },
  };

  const origins = await OriginRepository.getInstance(ctx.state).getAllPaginated({
    activeOnly,
    skip: Number(skip),
    limit: Math.min(Number(limit), ITEMS_PER_PAGE),
    sortOrder,
    sortBy,
    condition,
  });

  ctx.sendArray(origins);
};

export const createOrigin = async ctx => {
  const data = ctx.request.validated.body;

  const newOrigin = await OriginRepository.getInstance(ctx.state).createOne({
    data,
    log: true,
  });

  ctx.status = httpStatus.CREATED;
  ctx.body = newOrigin;
};

export const getOriginById = async ctx => {
  const { id } = ctx.params;

  const origin = await OriginRepository.getInstance(ctx.state).getById(id);
  ctx.sendArray(origin);
};

export const editOrigin = async ctx => {
  const data = ctx.request.validated.body;
  const { id } = ctx.params;

  const editedOrigin = await OriginRepository.getInstance(ctx.state).updateBy({
    data,
    condition: { id },
    log: true,
  });

  ctx.status = httpStatus.OK;
  ctx.body = editedOrigin;
};
