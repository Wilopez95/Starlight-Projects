import httpStatus from 'http-status';

import BrokerRepo from '../../../repos/broker.js';

export const getBrokerById = async ctx => {
  const { id } = ctx.params;

  const broker = await BrokerRepo.getInstance(ctx.state).getById({ id });

  ctx.sendObj(broker);
};

export const getBrokers = async ctx => {
  const condition = {};
  if (ctx.request.query.activeOnly) {
    condition.active = true;
  }

  const brokers = await BrokerRepo.getInstance(ctx.state).getAll({ condition });

  ctx.sendArray(brokers);
};

export const addBroker = async ctx => {
  const newBroker = await BrokerRepo.getInstance(ctx.state).createOne({
    data: ctx.request.validated.body,
    log: true,
  });

  ctx.status = httpStatus.CREATED;
  ctx.body = newBroker;
};

export const editBroker = async ctx => {
  const { concurrentData } = ctx.state;
  const { id } = ctx.params;

  const updatedBroker = await BrokerRepo.getInstance(ctx.state).updateBy({
    condition: { id },
    concurrentData,
    data: ctx.request.validated.body,
    log: true,
  });

  ctx.sendObj(updatedBroker);
};

export const deleteBroker = async ctx => {
  const { id } = ctx.params;

  await BrokerRepo.getInstance(ctx.state).deleteBy({
    condition: { id },
    log: true,
  });

  ctx.status = httpStatus.NO_CONTENT;
};
