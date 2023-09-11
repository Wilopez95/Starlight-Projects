import { Next } from 'koa';
import { SubscriptionServiceItemsSchedule } from '../../database/entities/tenant/SubscriptionServiceItemsSchedule';
import { Context } from '../../Interfaces/Auth';
import { BaseController } from '../base.controller';

export class SubscriptionServiceItemsSchedulesController extends BaseController {
  async getSubscriptionServiceItemsSchedules(ctx: Context, next: Next) {
    return super.getAll(ctx, next, SubscriptionServiceItemsSchedule);
  }

  async getSubscriptionServiceItemsScheduleBy(ctx: Context, next: Next) {
    return super.getBy(ctx, next, SubscriptionServiceItemsSchedule);
  }

  async addSubscriptionServiceItemsSchedules(ctx: Context, next: Next) {
    return super.insert(ctx, next, SubscriptionServiceItemsSchedule);
  }

  async updateSubscriptionServiceItemsSchedules(ctx: Context, next: Next) {
    return super.update(ctx, next, SubscriptionServiceItemsSchedule);
  }

  async deleteSubscriptionServiceItemsSchedules(ctx: Context, next: Next) {
    return super.delete(ctx, next, SubscriptionServiceItemsSchedule);
  }
}
