import httpStatus from 'http-status';

import CustomerGroupRepo from '../../../repos/customerGroup.js';

export const getCustomerGroupById = async ctx => {
  const { id } = ctx.params;

  const group = await CustomerGroupRepo.getInstance(ctx.state).getById({ id });

  ctx.sendObj(group);
};

export const getCustomerGroups = async ctx => {
  const { activeOnly, type, description } = ctx.request.validated.query;
  const condition = {};
  activeOnly && (condition.active = true);
  type && (condition.type = type);
  description && (condition.description = description);

  const groups = await CustomerGroupRepo.getInstance(ctx.state).getAll({
    condition,
  });

  ctx.sendArray(groups);
};

export const createCustomerGroup = async ctx => {
  const newGroup = await CustomerGroupRepo.getInstance(ctx.state).createOne({
    data: ctx.request.validated.body,
    log: true,
  });

  ctx.status = httpStatus.CREATED;
  ctx.body = newGroup;
};

export const editCustomerGroup = async ctx => {
  const { concurrentData } = ctx.state;
  const { id } = ctx.params;

  const updatedGroup = await CustomerGroupRepo.getInstance(ctx.state).updateBy({
    condition: { id },
    concurrentData,
    data: ctx.request.validated.body,
    log: true,
  });

  ctx.status = httpStatus.OK;
  ctx.body = updatedGroup;
};

export const deleteCustomerGroup = async ctx => {
  const { id } = ctx.params;

  await CustomerGroupRepo.getInstance(ctx.state).deleteBy({
    condition: { id },
    log: true,
  });

  ctx.status = httpStatus.NO_CONTENT;
};

// dif: https://d.pr/i/lND3v4
export const getAllWithCustomersQBData = async ctx => {
  const customerGroups = await CustomerGroupRepo.getInstance(ctx.state).getAllWithCustomersQB();
  ctx.sendArray(customerGroups);
};
