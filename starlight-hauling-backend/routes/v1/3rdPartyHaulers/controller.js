import httpStatus from 'http-status';

import ThirdPartyHaulersRepo from '../../../repos/3rdPartyHaulers.js';
import ThirdPartyHaulerCostsRepo from '../../../repos/3rdPartyHaulerCosts.js';

export const get3rdPartyHaulerById = async ctx => {
  const { id } = ctx.params;
  const historicalId = ctx?.request?.query?.historicalId;
  let hauler;
  if (historicalId) {
    hauler = await ThirdPartyHaulersRepo.getHistoricalInstance(ctx.state).getById({
      id: historicalId,
      fields: ['originalId', 'description', 'active', 'createdAt', 'updatedAt'],
    });
  } else {
    hauler = await ThirdPartyHaulersRepo.getInstance(ctx.state).getById({ id });
  }
  ctx.sendObj(hauler);
};

export const get3rdPartyHaulers = async ctx => {
  const { activeOnly } = ctx.request.query;
  const condition = {};
  if (activeOnly) {
    condition.active = true;
  }

  const haulers = await ThirdPartyHaulersRepo.getInstance(ctx.state).getAll({
    condition,
  });

  ctx.sendArray(haulers);
};

export const create3rdPartyHauler = async ctx => {
  const newHauler = await ThirdPartyHaulersRepo.getInstance(ctx.state).createOne({
    data: ctx.request.validated.body,
    log: true,
  });

  ctx.status = httpStatus.CREATED;
  ctx.body = newHauler;
};

export const edit3rdPartyHauler = async ctx => {
  const { concurrentData } = ctx.state;
  const { id } = ctx.params;

  const updatedHauler = await ThirdPartyHaulersRepo.getInstance(ctx.state).updateBy({
    condition: { id },
    concurrentData,
    data: ctx.request.validated.body,
    log: true,
  });

  ctx.sendObj(updatedHauler);
};

export const delete3rdPartyHauler = async ctx => {
  const { id } = ctx.params;

  await ThirdPartyHaulersRepo.getInstance(ctx.state).deleteBy({
    condition: { id },
    log: true,
  });

  ctx.status = httpStatus.NO_CONTENT;
};

export const getOperatingCosts = async ctx => {
  const { id: thirdPartyHaulerId } = ctx.params;
  const { businessLineId } = ctx.request.validated.query;

  const operatingCosts = await ThirdPartyHaulerCostsRepo.getInstance(ctx.state).getAllPopulated({
    condition: { thirdPartyHaulerId, businessLineId },
  });

  ctx.sendArray(operatingCosts);
};

export const updateOperatingCosts = async ctx => {
  const { id } = ctx.params;
  const { concurrentData } = ctx.state;
  const data = ctx.request.validated.body;

  if (data?.length) {
    data.forEach(item => (item.thirdPartyHaulerId = id));
    await ThirdPartyHaulerCostsRepo.getInstance(ctx.state).upsertMany({
      data,
      concurrentData,
      log: true,
    });
  }

  ctx.status = httpStatus.OK;
};
