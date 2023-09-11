import { Next } from 'koa';
import { DataSource } from 'typeorm';
import { LineItems } from '../../database/entities/tenant/LineItems';
import { Context } from '../../Interfaces/Auth';
import { IUpsertLineItems } from '../../Interfaces/LineItems';
import { BaseController } from '../base.controller';

export class LineItemsController extends BaseController {
  async getLineItems(ctx: Context, next: Next) {
    return super.getAll(ctx, next, LineItems);
  }

  async getLineItemsBy(ctx: Context, next: Next) {
    return super.getBy(ctx, next, LineItems);
  }

  async addLineItems(ctx: Context, next: Next) {
    return super.insert(ctx, next, LineItems);
  }

  async bulkAddLineItems(ctx: Context, next: Next) {
    ctx.request.body = ctx.request.body.data.map(item => {
      if (item.customRatesGroupLineItemsId) {
        return { ...item, globalRatesLineItemsId: null };
      } else {
        return item;
      }
    });
    return super.bulkInsert(ctx, next, LineItems);
  }

  async upsertLineItems(ctx: Context, next: Next) {
    ctx.request.body = ctx.request.body.data as IUpsertLineItems[];
    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );
    if (Array.isArray(ctx.request.body)) {
      await dataSource.manager.delete(LineItems, {
        orderId: ctx.request.body[0].orderId,
      });
      ctx.request.body.map(item => {
        delete item.priceToDisplay;
        return item;
      });
      await dataSource.destroy();
      return super.insert(ctx, next, LineItems);
    } else {
      await dataSource.manager.delete(LineItems, {
        orderId: ctx.request.body,
      });
      ctx.body = 'OK';
      ctx.status = 200;
      await dataSource.destroy();
      return next();
    }
  }

  async updateLineItems(ctx: Context, next: Next) {
    return super.update(ctx, next, LineItems);
  }

  async deleteLineItems(ctx: Context, next: Next) {
    return super.delete(ctx, next, LineItems);
  }
}
