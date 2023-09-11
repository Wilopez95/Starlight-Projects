import MqSender from '../amqp/sender.js';
import {
  AMQP_QUEUE_SYNC_JOB_SITES_TO_DISPATCH,
  AMQP_QUEUE_CUSTOMERS_TO_ROUTE_PLANNER,
  AMQP_QUEUE_SYNC_TRUCKS_TO_DISPATCH,
  AMQP_QUEUE_SYNC_DRIVERS_TO_DISPATCH,
  AMQP_QUEUE_SYNC_WOS_MEDIA_TO_DISPATCH,
} from '../../config.js';

import { publisher as syncToDispatch } from './syncSubscriptionWosToDispatch/publisher.js';
import { publisher as syncFromDispatch } from './syncSubscriptionWosFromDispatch/publisher.js';

import { publisher as syncIndependentToDispatch } from './syncIndependentWoToDispatch/publisher.js';
import { publisher as syncIndependentFromDispatch } from './syncIndependentWoFromDispatch/publisher.js';

import { publisher as syncDeleteWosToDispatch } from './syncDeleteWosToDispatch/publisher.js';
import { publisher as syncServiceItemsToDispatch } from './syncServiceItemsToDispatch/publisher.js';

const mqSender = MqSender.getInstance();

const sendToMq = async (ctx, queueName, data) => {
  try {
    await mqSender.sendTo(ctx, queueName, data);
  } catch (error) {
    ctx.logger.error(error);
  }
};

export const upsertJobSite = (ctx, data) =>
  sendToMq(ctx, AMQP_QUEUE_SYNC_JOB_SITES_TO_DISPATCH, data);
export const upsertCustomer = (ctx, data) =>
  sendToMq(ctx, AMQP_QUEUE_CUSTOMERS_TO_ROUTE_PLANNER, data);
export const upsertTruck = (ctx, data) => sendToMq(ctx, AMQP_QUEUE_SYNC_TRUCKS_TO_DISPATCH, data);
export const upsertDriver = (ctx, data) => sendToMq(ctx, AMQP_QUEUE_SYNC_DRIVERS_TO_DISPATCH, data);
export const syncWosMedia = (ctx, data) =>
  sendToMq(ctx, AMQP_QUEUE_SYNC_WOS_MEDIA_TO_DISPATCH, data);

export const publishers = {
  syncToDispatch,
  syncFromDispatch, // TODO: move this stub to test mocks when routePlanner service will be done
  syncIndependentToDispatch,
  syncIndependentFromDispatch,
  syncDeleteWosToDispatch,
  syncServiceItemsToDispatch,
};
