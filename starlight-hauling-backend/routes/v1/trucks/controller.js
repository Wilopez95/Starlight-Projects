import httpStatus from 'http-status';
import pick from 'lodash/fp/pick.js';

import { SORT_ORDER } from '../../../consts/sortOrders.js';
import TruckRepository from '../../../repos/truck.js';

const ITEMS_PER_PAGE = 25;
const getFiltersData = pick(['filterByBusinessUnit', 'filterByTruckType', 'filterByBusinessLine']);

export const getTruckById = async ctx => {
  const { id } = ctx.params;

  const truckType = await TruckRepository.getInstance(ctx.state).getById({ id });
  ctx.sendArray(truckType);
};

export const getTrucks = async ctx => {
  const {
    activeOnly = false,
    skip = 0,
    limit = ITEMS_PER_PAGE,
    sortOrder = SORT_ORDER.desc,
    sortBy,
    query,
  } = ctx.request.query;

  const condition = {
    filters: getFiltersData(ctx.request.validated.query),
    query,
  };

  const trucks = await TruckRepository.getInstance(ctx.state).getAllPaginated({
    activeOnly,
    skip: Number(skip),
    limit: Math.min(Number(limit), ITEMS_PER_PAGE),
    sortOrder,
    sortBy,
    condition,
  });

  ctx.sendArray(trucks);
};

export const getAllTrucks = async ctx => {
  const { activeOnly, truckIds, query } = ctx.request.validated.query;
  const condition = {
    filters: getFiltersData(ctx.request.validated.query),
  };
  truckIds && (condition.ids = truckIds);
  query && (condition.query = query);

  const truckTypes = await TruckRepository.getInstance(ctx.state).getAllPaginated({
    activeOnly,
    sortOrder: SORT_ORDER.asc,
    sortBy: 'description',
    condition,
  });

  ctx.sendArray(truckTypes);
};

export const createTruck = async ctx => {
  const data = ctx.request.validated.body;

  const newTruck = await TruckRepository.getInstance(ctx.state).createOne({
    data,
    log: true,
  });

  ctx.status = httpStatus.CREATED;
  ctx.body = newTruck;
};

export const editTrucks = async ctx => {
  const data = ctx.request.validated.body;
  const { id } = ctx.params;

  const editedTruckType = await TruckRepository.getInstance(ctx.state).updateOne({
    data,
    id,
    log: true,
  });

  ctx.status = httpStatus.OK;
  ctx.body = editedTruckType;
};

export const updateTruckLocation = async ctx => {
  const { id } = ctx.params;
  const { location } = ctx.request.validated.body;

  const truckRepo = TruckRepository.getInstance(ctx.state);
  const editedTruck = await truckRepo.updateLocation(id, location);

  ctx.status = httpStatus.OK;
  ctx.body = editedTruck;
};
