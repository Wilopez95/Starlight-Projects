import { Next } from 'koa';
import { DataSource, In } from 'typeorm';
import { SubscriptionSurchargeItemHistorical } from '../../database/entities/tenant/SubscriptionSurchargeItemHistorical';
import { SubscriptionSurchargeItem } from '../../database/entities/tenant/SubscriptionSurchargeItem';
import { BaseController } from '../base.controller';
import { Context } from '../../Interfaces/Auth';

export class SubscriptionSurchargeItemController extends BaseController {
  async getSubscriptionSurchargeItem(ctx: Context, next: Next) {
    return super.getAll(ctx, next, SubscriptionSurchargeItem);
  }

  async getSubscriptionSurchargeItemBy(ctx: Context, next: Next) {
    return super.getBy(ctx, next, SubscriptionSurchargeItem);
  }

  async addSubscriptionSurchargeItem(ctx: Context, next: Next) {
    return super.insert(ctx, next, SubscriptionSurchargeItem, SubscriptionSurchargeItemHistorical);
  }

  async upsertSubscriptionSurchargeItem(ctx: Context, next: Next) {
    const id = ctx.request.body.id;
    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );
    const lineItemsIds = await dataSource
      .createQueryBuilder()
      .select('subscriptionSurcharge.id')
      .from(SubscriptionSurchargeItem, 'subscriptionSurcharge')
      .where(`subscriptionSurcharge.subscriptionOrderId = ${id}`)
      .getMany();

    if (lineItemsIds.length > 0) {
      const ids: number[] = lineItemsIds.map((item: SubscriptionSurchargeItem) => item.id);
      dataSource.manager.delete(SubscriptionSurchargeItem, {
        id: In(ids),
      });
    }
    await dataSource.destroy();
    ctx.request.body = ctx.request.body.data;
    return super.bulkInserts(
      ctx,
      next,
      SubscriptionSurchargeItem,
      SubscriptionSurchargeItemHistorical,
    );
  }

  async updateSubscriptionSurchargeItem(ctx: Context, next: Next) {
    return super.update(ctx, next, SubscriptionSurchargeItem, SubscriptionSurchargeItemHistorical);
  }

  async deleteSubscriptionSurchargeItem(ctx: Context, next: Next) {
    return super.delete(ctx, next, SubscriptionSurchargeItem, SubscriptionSurchargeItemHistorical);
  }
}
