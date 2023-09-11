import { Next } from 'koa';
import { SubscriptionHistory } from '../../database/entities/tenant/SubscriptionHistory';
import { Context } from '../../Interfaces/Auth';
import { BaseController } from '../base.controller';

export class SubscriptionHistoryController extends BaseController {
  async getSubscriptionHistory(ctx: Context, next: Next) {
    ctx.request.body = { where: { subscriptionId: +ctx.url.split('/')[4] } };
    return super.getBy(ctx, next, SubscriptionHistory);
  }

  async getSubscriptionHistoryBy(ctx: Context, next: Next) {
    return super.getBy(ctx, next, SubscriptionHistory);
  }

  async addSubscriptionHistory(ctx: Context, next: Next) {
    return super.insert(ctx, next, SubscriptionHistory);
  }

  async updateSubscriptionHistory(ctx: Context, next: Next) {
    const id: number = +ctx.url.split('/')[4];
    return super.update(ctx, next, SubscriptionHistory, undefined, id);
  }

  async deleteSubscriptionHistory(ctx: Context, next: Next) {
    ctx.request.body = ctx.query;
    return super.delete(ctx, next, SubscriptionHistory);
  }
}
