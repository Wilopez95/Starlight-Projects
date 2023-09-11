import { Next } from 'koa';
import { DataSource } from 'typeorm';
import { SubscriptionLineItem } from '../../database/entities/tenant/SubscriptionLineItem';
import { SubscriptionLineItemHistorical } from '../../database/entities/tenant/SubscriptionLineItemHistorical';
import { Context } from '../../Interfaces/Auth';
import { BaseController } from '../base.controller';

export class SubscriptionLineItemController extends BaseController {
  async getSubscriptionLineItems(ctx: Context, next: Next) {
    return super.getAll(ctx, next, SubscriptionLineItem);
  }

  async getSubscriptionLineItemBy(ctx: Context, next: Next) {
    return super.getBy(ctx, next, SubscriptionLineItem);
  }

  async addSubscriptionLineItem(ctx: Context, next: Next) {
    return super.insert(ctx, next, SubscriptionLineItem, SubscriptionLineItemHistorical);
  }

  async bulkaddSubscriptionLineItem(ctx: Context, next: Next) {
    ctx.request.body = ctx.request.body.data;
    return super.bulkInserts(ctx, next, SubscriptionLineItem, SubscriptionLineItemHistorical);
  }

  async updateSubscriptionLineItem(ctx: Context, next: Next) {
    const id: number = +ctx.url.split('/')[4];
    delete ctx.request.body.lineItems;
    return super.update(ctx, next, SubscriptionLineItem, SubscriptionLineItemHistorical, id);
  }

  async deleteSubscriptionLineItem(ctx: Context, next: Next) {
    return super.delete(ctx, next, SubscriptionLineItem, SubscriptionLineItemHistorical);
  }

  async upsertSubscriptionLineItems(ctx: Context, next: Next) {
    ctx.request.body = ctx.request.body.data;
    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );

    await dataSource.manager.update(
      SubscriptionLineItem,
      { subscriptionId: ctx.request.body[0].subscriptionId },
      { isDeleted: true },
    );
    await dataSource.destroy();
    return super.insert(ctx, next, SubscriptionLineItem);
  }

  async getItemBySpecificDate(ctx: Context, next: Next) {
    const { lineItemId, specifiedDate } = ctx.request.body.data;
    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );
    const subscription = await dataSource
      .createQueryBuilder()
      .select('*')
      .addSelect(
        'coalesce(subsLineItem.effectiveDate, subsLineItem.createdAt)::timestamp as effective_date',
      )
      .addSelect('subscription.billingCycle as billingCycle')
      .from(SubscriptionLineItemHistorical, 'subsLineItem')
      .innerJoin(
        'SubscriptionServiceItem',
        'subsServiceItem',
        'subsLineItem.subscriptionServiceItemId = subsServiceItem.id',
      )
      .innerJoin(
        'Subscriptions',
        'subscription',
        'subsServiceItem.subscriptionId = subscription.id',
      )
      .where({ originalId: lineItemId })
      .andWhere(
        `coalesce(subsLineItem.effectiveDate, subsLineItem.createdAt) <= '${specifiedDate}'`,
      )
      .orderBy('coalesce(subsLineItem.effectiveDate, subsLineItem.createdAt)::timestamp', 'DESC')
      .getRawOne();
    await dataSource.destroy();
    ctx.body = subscription;
    ctx.status = 200;
    return next();
  }

  async getNextItemBySpecificDate(ctx: Context, next: Next) {
    const { lineItemId, specifiedDate } = ctx.request.body.data;
    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );
    const subscription = await dataSource
      .createQueryBuilder()
      .select('*')
      .addSelect(
        'coalesce(subsLineItem.effectiveDate, subsLineItem.createdAt)::timestamp as effective_date',
      )
      .from(SubscriptionLineItemHistorical, 'subsLineItem')
      .where({ originalId: lineItemId })
      .andWhere(`coalesce(subsLineItem.effectiveDate, subsLineItem.createdAt) > '${specifiedDate}'`)
      .orderBy('coalesce(subsLineItem.effectiveDate, subsLineItem.createdAt)::timestamp', 'ASC')
      .getRawOne();
    await dataSource.destroy();
    ctx.body = subscription;
    ctx.status = 200;
    return next();
  }
}
