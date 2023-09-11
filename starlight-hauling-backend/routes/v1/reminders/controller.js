import httpStatus from 'http-status';

import ReminderRepo from '../../../repos/reminder.js';
import UserReminderRepo from '../../../repos/userReminder.js';

import { subscriptionHistoryEmitter } from '../../../services/subscriptionHistory/emitter.js';

import { REMINDER_TYPE } from '../../../consts/reminderTypes.js';
import { SUBSCRIPTION_HISTORY_EVENT } from '../../../consts/subscriptionHistoryEvents.js';

export const getReminder = async ctx => {
  const condition = ctx.request.validated.query;
  condition.isProcessed = false;

  const reminders = await ReminderRepo.getInstance(ctx.state).getFutureBy({
    condition,
  });

  ctx.sendArray(reminders);
};

export const createReminder = async ctx => {
  const data = ctx.request.validated.body;

  const newReminder = await ReminderRepo.getInstance(ctx.state).createOne({
    data,
  });

  if (data.type === REMINDER_TYPE.annualEventReminder) {
    subscriptionHistoryEmitter.emit(SUBSCRIPTION_HISTORY_EVENT.addAnnualReminder, ctx.state, {
      subscriptionId: data.entityId,
      newValue: data,
    });
  }

  ctx.status = httpStatus.CREATED;
  ctx.body = newReminder;
};

export const editReminder = async ctx => {
  const { id } = ctx.params;

  const updatedReminder = await ReminderRepo.getInstance(ctx.state).updateBy({
    condition: { id },
    data: ctx.request.validated.body,
  });

  ctx.status = httpStatus.OK;
  ctx.body = updatedReminder;
};

export const deleteReminder = async ctx => {
  const { id } = ctx.params;

  await ReminderRepo.getInstance(ctx.state).deleteBy({ condition: { id } });

  ctx.status = httpStatus.NO_CONTENT;
};

export const getUserReminders = async ctx => {
  const { userId } = ctx.state.user;
  const { skip, limit, ...condition } = ctx.request.validated.query;
  condition.active = true;
  condition.userId = userId;

  const reminders = await UserReminderRepo.getInstance(ctx.state).getAllPaginated({
    condition,
    skip,
    limit,
  });

  ctx.sendArray(reminders);
};

export const editUserReminder = async ctx => {
  const { id } = ctx.params;

  const updatedReminder = await UserReminderRepo.getInstance(ctx.state).updateBy({
    condition: { id },
    data: {
      ...ctx.request.validated.body,
      informedByAppTraceId: (ctx.request.validated.body.informedByAppAt || null) && ctx.state.reqId,
    },
  });

  ctx.status = httpStatus.OK;
  ctx.body = updatedReminder;
};

export const deleteAllUserReminders = async ctx => {
  const { userId } = ctx.state.user;

  await UserReminderRepo.getInstance(ctx.state).updateBy({
    condition: { userId },
    data: { active: false },
  });

  ctx.status = httpStatus.NO_CONTENT;
};

export const deleteUserReminder = async ctx => {
  const { userId } = ctx.state.user;
  const { id } = ctx.params;

  await UserReminderRepo.getInstance(ctx.state).updateBy({
    condition: { id, userId },
    data: { active: false },
  });

  ctx.status = httpStatus.NO_CONTENT;
};
