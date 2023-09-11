import { Next } from 'koa';
import { SubscriptionRecurringLineItemsSchedule } from '../../database/entities/tenant/SubscriptionRecurringLineItemsSchedule';
import { Context } from '../../Interfaces/Auth';
import { BaseController } from '../base.controller';

export class SubscriptionRecurringLineItemsSchedulesController extends BaseController {
  async getSubscriptionRecurringLineItemsSchedules(ctx: Context, next: Next) {
    return super.getAll(ctx, next, SubscriptionRecurringLineItemsSchedule);
  }

  async getSubscriptionRecurringLineItemsScheduleBy(ctx: Context, next: Next) {
    return super.getBy(ctx, next, SubscriptionRecurringLineItemsSchedule);
  }

  async addSubscriptionRecurringLineItemsSchedules(ctx: Context, next: Next) {
    return super.insert(ctx, next, SubscriptionRecurringLineItemsSchedule);
  }

  async updateSubscriptionRecurringLineItemsSchedules(ctx: Context, next: Next) {
    return super.update(ctx, next, SubscriptionRecurringLineItemsSchedule);
  }

  async deleteSubscriptionRecurringLineItemsSchedules(ctx: Context, next: Next) {
    return super.delete(ctx, next, SubscriptionRecurringLineItemsSchedule);
  }
}
