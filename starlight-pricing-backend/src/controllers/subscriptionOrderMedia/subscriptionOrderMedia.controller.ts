import { Next } from 'koa';
import { DataSource } from 'typeorm';
import { SubscriptionOrderMedia } from '../../database/entities/tenant/SubscriptionOrdersMedia';
import { BaseController } from '../base.controller';
import { SubscriptionOrderMediaHistorical } from '../../database/entities/tenant/SubscriptionOrdersMediaHistorical';
import { SubscriptionWorkOrders } from '../../database/entities/tenant/SubscriptionWorkOrders';
import httpStatus from '../../consts/httpStatusCodes';
import { Context } from '../../Interfaces/Auth';

export class SubscriptionOrderMediaController extends BaseController {
  async upsertSubscriptionOrderMedia(ctx: Context, next: Next) {
    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );
    await dataSource.manager.delete(SubscriptionOrderMedia, {
      orderId: ctx.request.body[0].subscriptionOrderId,
    });
    await dataSource.destroy();
    return super.insert(ctx, next, SubscriptionOrderMedia, SubscriptionOrderMediaHistorical);
  }
  async createOneFromUrl(ctx: Context, next: Next) {
    const { subscriptionWorkOrderId } = ctx.request.body;
    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );
    const getSubsciption = await dataSource
      .createQueryBuilder()
      .select('subOrders.subscriptionId')
      .from(SubscriptionWorkOrders, 'subWorkOrders')
      .innerJoin(
        'SubscriptionOrders',
        'subOrders',
        'subWorkOrders.subscriptionOrderId = subOrders.id',
      )
      .where(`subWorkOrders.id= ${subscriptionWorkOrderId}`)
      .getRawOne();
    await dataSource.destroy();
    if (!getSubsciption.subOrders_subscription_id) {
      ctx.status = httpStatus.BAD_REQUEST;
      return next();
    }
    const copyUrl = ctx.request.body.url; //this variable prevents mutability
    const fileUrlParts = copyUrl.split('/');
    const fileName = fileUrlParts.pop();
    ctx.request.body.subscriptionId = getSubsciption.subOrders_subscription_id;
    ctx.request.body.fileName = fileName;
    return await super.insert(ctx, next, SubscriptionOrderMedia, SubscriptionOrderMediaHistorical);
  }
}
