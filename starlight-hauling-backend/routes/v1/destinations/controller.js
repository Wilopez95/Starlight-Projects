import httpStatus from 'http-status';

import DestinationRepository from '../../../repos/destination.js';
import { SORT_ORDER } from '../../../consts/sortOrders.js';

const ITEMS_PER_PAGE = 25;

export const getDestinations = async ctx => {
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

  if (activeOnly) {
    condition.active = true;
  }

  const destinations = await DestinationRepository.getInstance(ctx.state).getAllPaginated({
    condition,
    skip: Number(skip),
    limit: Math.min(Number(limit), ITEMS_PER_PAGE),
    sortOrder,
    sortBy,
  });

  ctx.sendArray(destinations);
};

export const getAllDestinations = async ctx => {
  const { activeOnly = false, sortOrder = SORT_ORDER.desc, sortBy } = ctx.request.query;

  const condition = {
    filters: { filterByBusinessUnits: ctx.request.validated.query.filterByBusinessUnits },
  };

  if (activeOnly) {
    condition.active = true;
  }
  const districts = await DestinationRepository.getInstance(ctx.state).getAll({
    sortOrder,
    sortBy,
    condition,
  });

  ctx.sendArray(districts);
};

export const getDestinationsById = async ctx => {
  const { id } = ctx.params;

  const destination = await DestinationRepository.getInstance(ctx.state).getById({ id });
  ctx.sendArray(destination);
};

export const createDestination = async ctx => {
  const data = ctx.request.validated.body;

  const newDestination = await DestinationRepository.getInstance(ctx.state).createOne({
    data,
    log: true,
  });

  ctx.status = httpStatus.CREATED;
  ctx.body = newDestination;
};

export const editDestination = async ctx => {
  const data = ctx.request.validated.body;
  const { id } = ctx.params;

  const editedDestinations = await DestinationRepository.getInstance(ctx.state).updateBy({
    data,
    condition: {
      id,
    },
    log: true,
  });

  ctx.status = httpStatus.OK;
  ctx.body = editedDestinations;
};
