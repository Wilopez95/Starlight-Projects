import { Next } from 'koa';
import { DataSource } from 'typeorm';
import { calcPriceToDisplay } from '../../utils/calcPriceToDisplay';
import { ThresholdItems } from '../../database/entities/tenant/ThresholdItems';
import { ThresholdItemsHistorical } from '../../database/entities/tenant/ThresholdItemsHistorical';
import { BaseController } from '../base.controller';
import { Context } from '../../Interfaces/Auth';

export class ThresholdItemsController extends BaseController {
  async getThresholdItems(ctx: Context, next: Next) {
    return super.getAll(ctx, next, ThresholdItems);
  }

  async getThresholdItemBy(ctx: Context, next: Next) {
    return super.getBy(ctx, next, ThresholdItems);
  }

  async addThresholdItems(ctx: Context, next: Next) {
    ctx.request.body = calcPriceToDisplay(ctx.request.body as ThresholdItems);
    return super.insert(ctx, next, ThresholdItems, ThresholdItemsHistorical);
  }

  async upsertThresholdItems(ctx: Context, next: Next) {
    ctx.request.body = ctx.request.body.data;
    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );

    if (Array.isArray(ctx.request.body)) {
      await dataSource.manager.delete(ThresholdItems, {
        orderId: ctx.request.body[0].orderId,
      });
      ctx.request.body = ctx.request.body.map(item => {
        item = calcPriceToDisplay(item as ThresholdItems);
        return item;
      });
      await dataSource.destroy();
      return super.insertMany(ctx, next, ThresholdItems, ThresholdItemsHistorical);
    } else {
      await dataSource.manager.delete(ThresholdItems, {
        orderId: ctx.request.body,
      });
      await dataSource.destroy();
      ctx.body = [];
      ctx.status = 200;
      return next();
    }
  }

  async bulkAddThresholdItems(ctx: Context, next: Next) {
    ctx.request.body = ctx.request.body.data;
    return super.bulkInsert(ctx, next, ThresholdItems, ThresholdItemsHistorical);
  }

  async updateThresholdItems(ctx: Context, next: Next) {
    return super.update(ctx, next, ThresholdItems, ThresholdItemsHistorical);
  }

  async deleteThresholdItems(ctx: Context, next: Next) {
    return super.delete(ctx, next, ThresholdItems, ThresholdItemsHistorical);
  }
}
