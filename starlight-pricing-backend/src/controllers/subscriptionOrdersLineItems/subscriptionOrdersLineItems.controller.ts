import { Next } from 'koa';
import { DataSource } from 'typeorm';
import { SubscriptionOrdersLineItemsHistorical } from '../../database/entities/tenant/SubscriptionOrdersLineItemsHistorical';
import { SubscriptionOrdersLineItems } from '../../database/entities/tenant/SubscriptionOrdersLineItems';
import { BaseController } from '../base.controller';
import { Context } from '../../Interfaces/Auth';

export class SubscriptionOrdersLineItemsController extends BaseController {
  async getSubscriptionOrdersLineItems(ctx: Context, next: Next) {
    return super.getAll(ctx, next, SubscriptionOrdersLineItems);
  }

  async getSubscriptionOrdersLineItemBy(ctx: Context, next: Next) {
    return super.getBy(ctx, next, SubscriptionOrdersLineItems);
  }

  async addSubscriptionOrdersLineItems(ctx: Context, next: Next) {
    return super.insert(
      ctx,
      next,
      SubscriptionOrdersLineItems,
      SubscriptionOrdersLineItemsHistorical,
    );
  }

  async updateSubscriptionOrdersLineItems(ctx: Context, next: Next) {
    return super.update(
      ctx,
      next,
      SubscriptionOrdersLineItems,
      SubscriptionOrdersLineItemsHistorical,
    );
  }

  async deleteSubscriptionOrdersLineItems(ctx: Context, next: Next) {
    return super.delete(
      ctx,
      next,
      SubscriptionOrdersLineItems,
      SubscriptionOrdersLineItemsHistorical,
    );
  }

  async bulkAddSubscriptionOrdersLineItems(ctx: Context, next: Next) {
    ctx.request.body = ctx.request.body.data;
    return super.bulkInserts(
      ctx,
      next,
      SubscriptionOrdersLineItems,
      SubscriptionOrdersLineItemsHistorical,
    );
  }

  async upsertSubscriptionOrdersLineItems(ctx: Context, next: Next) {
    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );
    await dataSource.manager.delete(SubscriptionOrdersLineItems, {
      subscriptionOrderId: ctx.request.body[0].subscriptionOrderId,
    });
    await dataSource.destroy();
    return super.insert(
      ctx,
      next,
      SubscriptionOrdersLineItems,
      SubscriptionOrdersLineItemsHistorical,
    );
  }
}
