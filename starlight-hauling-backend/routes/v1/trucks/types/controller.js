import httpStatus from 'http-status';
import { SORT_ORDER } from '../../../../consts/sortOrders.js';
import TruckTypeRepository from '../../../../repos/truckType.js';

const ITEMS_PER_PAGE = 25;

export const getTruckTypes = async ctx => {
  const {
    activeOnly = false,
    skip = 0,
    limit = ITEMS_PER_PAGE,
    sortOrder = SORT_ORDER.desc,
    sortBy,
  } = ctx.request.query;

  const truckTypes = await TruckTypeRepository.getInstance(ctx.state).getAllPaginated({
    activeOnly,
    skip: Number(skip),
    limit: Math.min(Number(limit), ITEMS_PER_PAGE),
    sortOrder,
    sortBy,
  });

  ctx.sendArray(truckTypes);
};

export const getAllTruckTypes = async ctx => {
  const { activeOnly } = ctx.request.query;

  const truckTypes = await TruckTypeRepository.getInstance(ctx.state).getAllPaginated({
    activeOnly,
    sortOrder: SORT_ORDER.asc,
    sortBy: 'description',
  });

  ctx.sendArray(truckTypes);
};

export const getTruckTypeById = async ctx => {
  const { id } = ctx.params;

  const truckType = await TruckTypeRepository.getInstance(ctx.state).getById({ id });
  ctx.sendArray(truckType);
};

export const createTruckTypes = async ctx => {
  const data = ctx.request.validated.body;

  const newTruckType = await TruckTypeRepository.getInstance(ctx.state).createOne({
    data,
    log: true,
  });

  ctx.status = httpStatus.CREATED;
  ctx.body = newTruckType;
};

export const editTruckTypes = async ctx => {
  const data = ctx.request.validated.body;
  const { id } = ctx.params;

  const editedTruckType = await TruckTypeRepository.getInstance(ctx.state).updateOne({
    data,
    id,
    log: true,
  });

  ctx.status = httpStatus.OK;
  ctx.body = editedTruckType;
};
