import { Next } from 'koa';
import { DataSource } from 'typeorm';
import { SubscriptionWorkOrdersMedia } from '../../database/entities/tenant/SubscriptionWorkOrdersMedia';
import { BaseController } from '../base.controller';
import { SubscriptionWorkOrdersMediaHistorical } from '../../database/entities/tenant/SubscriptionWorkOrdersMediaHistorical';
import { Context } from '../../Interfaces/Auth';

export class SubscriptionWorkOrderMediaController extends BaseController {
  async upsertSubscriptionOrderMedia(ctx: Context, next: Next) {
    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );
    await dataSource.manager.delete(SubscriptionWorkOrdersMedia, {
      orderId: ctx.request.body[0].subscriptionOrderId,
    });
    await dataSource.destroy();
    return super.insert(
      ctx,
      next,
      SubscriptionWorkOrdersMedia,
      SubscriptionWorkOrdersMediaHistorical,
    );
  }
  async createOneFromUrl(ctx: Context, next: Next) {
    const copyUrl = ctx.request.body.url; //this variable prevents mutability
    const fileUrlParts = copyUrl.split('/');
    const fileName = fileUrlParts.pop();
    ctx.request.body.fileName = fileName;
    return await super.insert(
      ctx,
      next,
      SubscriptionWorkOrdersMedia,
      SubscriptionWorkOrdersMediaHistorical,
    );
  }

  async getData(ctx: Context, next: Next) {
    const id: number = +ctx.request.url.split('/')[4];
    ctx.request.body.subscriptionWorkOrderId = id;
    return await super.getBy(ctx, next, SubscriptionWorkOrdersMedia);
  }
}
