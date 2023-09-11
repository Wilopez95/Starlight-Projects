import { Next } from 'koa';
import { DataSource } from 'typeorm';
import { SurchargeItem } from '../../database/entities/tenant/SurchargeItem';
import { SurchargeItemHistorical } from '../../database/entities/tenant/SurchargeItemHistorical';
import { Context } from '../../Interfaces/Auth';
import { BaseController } from '../base.controller';

export class SurchargeItemController extends BaseController {
  async getSurchargeItems(ctx: Context, next: Next) {
    return super.getAll(ctx, next, SurchargeItem);
  }

  async getSurchargeItemBy(ctx: Context, next: Next) {
    return super.getBy(ctx, next, SurchargeItem);
  }

  async addSurchargeItem(ctx: Context, next: Next) {
    return super.insert(ctx, next, SurchargeItem, SurchargeItemHistorical);
  }

  async bulkAddSurchargeItem(ctx: Context, next: Next) {
    ctx.request.body = ctx.request.body.data;
    return super.bulkInsert(ctx, next, SurchargeItem, SurchargeItemHistorical);
  }

  async upsertSurchargeItem(ctx: Context, next: Next) {
    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );
    await dataSource.manager.delete(SurchargeItem, {
      orderId: ctx.request.body?.data?.[0]?.surchargeId,
    });
    await dataSource.destroy();
    return super.insert(ctx, next, SurchargeItem, SurchargeItemHistorical);
  }

  async updateSurchargeItem(ctx: Context, next: Next) {
    return super.update(ctx, next, SurchargeItem, SurchargeItemHistorical);
  }

  async deleteSurchargeItem(ctx: Context, next: Next) {
    return super.delete(ctx, next, SurchargeItem, SurchargeItemHistorical);
  }
}
