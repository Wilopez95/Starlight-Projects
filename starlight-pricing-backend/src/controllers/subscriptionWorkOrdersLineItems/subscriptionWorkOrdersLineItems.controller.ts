import { Next } from 'koa';
import { DataSource } from 'typeorm';
import { SubscriptionWorkOrdersLineItems } from '../../database/entities/tenant/SubscriptionWorkOrdersLineItems';
import { BaseController } from '../base.controller';
import { SubscriptionWorkOrdersLineItemsHistorical } from '../../database/entities/tenant/SubscriptionWorkOrdersLineItemsHistorical';
import { Context } from '../../Interfaces/Auth';

export class SubscriptionWorkOrdersLineItemsController extends BaseController {
  async upsertSubscriptionOrderMedia(ctx: Context, next: Next) {
    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );
    await dataSource.manager.delete(SubscriptionWorkOrdersLineItems, {
      orderId: ctx.request.body[0].subscriptionOrderId,
    });
    await dataSource.destroy();
    return super.insert(
      ctx,
      next,
      SubscriptionWorkOrdersLineItems,
      SubscriptionWorkOrdersLineItemsHistorical,
    );
  }
}
