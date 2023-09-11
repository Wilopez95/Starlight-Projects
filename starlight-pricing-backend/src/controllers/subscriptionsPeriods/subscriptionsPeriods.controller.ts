import { Next } from 'koa';
import { SubscriptionsPeriods } from '../../database/entities/tenant/SubscriptionsPeriods';
import { Context } from '../../Interfaces/Auth';
import { BaseController } from '../base.controller';

export class SubscriptionsPeriodsController extends BaseController {
  async getSubscriptionsPeriods(ctx: Context, next: Next) {
    return super.getAll(ctx, next, SubscriptionsPeriods);
  }

  async getSubscriptionsPeriodBy(ctx: Context, next: Next) {
    return super.getBy(ctx, next, SubscriptionsPeriods);
  }

  async addSubscriptionsPeriods(ctx: Context, next: Next) {
    return super.insert(ctx, next, SubscriptionsPeriods);
  }

  async updateSubscriptionsPeriods(ctx: Context, next: Next) {
    return super.update(ctx, next, SubscriptionsPeriods);
  }

  async deleteSubscriptionsPeriods(ctx: Context, next: Next) {
    return super.delete(ctx, next, SubscriptionsPeriods);
  }
}
