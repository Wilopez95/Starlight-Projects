import httpStatus from 'http-status';

import { getUsersAsMap } from '../../../../services/ums.js';

import TruckDriverCostsRepo from '../../../../repos/truckDriverCost.js';

const remapWithUsers = (result, users) => {
  result?.forEach(
    item => (item.changedBy = { id: item.changedBy, name: users.get(item.changedBy) }),
  );
};

export const getCostsById = async ctx => {
  const { id } = ctx.params;
  const rate = await TruckDriverCostsRepo.getInstance(ctx.state).getPopulatedById({ id });

  if (rate) {
    const users = await getUsersAsMap(ctx, [rate.changedBy]);

    remapWithUsers([rate], users);
  }

  ctx.sendObj(rate);
};

export const getCosts = async ctx => {
  const { skip, limit, activeOnly, detailed, buId, date } = ctx.request.validated.query;
  const condition = date ? { date } : {};
  if ('buId' in ctx.request.query) {
    condition.businessUnitId = buId || null;
  }

  const result = await TruckDriverCostsRepo.getInstance(ctx.state).getAllPaginated({
    condition,
    skip,
    limit,
    activeOnly,
    detailed,
  });

  const userIds = result.map(({ changedBy }) => changedBy);
  if (userIds.length) {
    const users = await getUsersAsMap(ctx, userIds);

    remapWithUsers(result, users);
  }

  ctx.sendArray(result);
};

export const createCosts = async ctx => {
  const data = ctx.request.validated.body;
  const { userId } = ctx.state.user;

  const [newRate, users] = await Promise.all([
    TruckDriverCostsRepo.getInstance(ctx.state).createOne({
      data: { ...data, changedBy: userId },
      log: true,
    }),
    getUsersAsMap(ctx, [userId]),
  ]);

  remapWithUsers([newRate], users);

  ctx.status = httpStatus.CREATED;
  ctx.body = newRate;
};

export const editCosts = async ctx => {
  const data = ctx.request.validated.body;
  const { userId } = ctx.state.user;
  const { concurrentData } = ctx.state;
  const { id } = ctx.params;

  const [updatedRate, users] = await Promise.all([
    TruckDriverCostsRepo.getInstance(ctx.state).updateOne({
      id,
      concurrentData,
      data: { ...data, changedBy: userId },
      log: true,
    }),
    getUsersAsMap(ctx, [userId]),
  ]);

  remapWithUsers([updatedRate], users);

  ctx.sendObj(updatedRate);
};
