import { Next } from 'koa';
import { DataSource, In } from 'typeorm';
import { RecurrentOrderTemplateLineItems } from '../../database/entities/tenant/RecurrentOrderTemplateLineItems';
import { RecurrentOrderTemplateLineItemsHistorical } from '../../database/entities/tenant/RecurrentOrderTemplateLineItemsHistorical';
import { Context } from '../../Interfaces/Auth';
import { BaseController } from '../base.controller';

export class RecurrentOrderTemplateLineItemsController extends BaseController {
  async upsertOrderTemplateLineItem(ctx: Context, next: Next) {
    const id: number = ctx.request.body.id;
    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );
    const lineItemsIds = await dataSource
      .createQueryBuilder()
      .select('recurrentOrderTemplateLineItems.id')
      .from(RecurrentOrderTemplateLineItems, 'recurrentOrderTemplateLineItems')
      .where(`recurrentOrderTemplateLineItems.recurrentOrderTemplateId = ${id}`)
      .getMany();

    if (lineItemsIds.length > 0) {
      const ids: number[] = lineItemsIds.map((item: RecurrentOrderTemplateLineItems) => item.id);
      dataSource.manager.delete(RecurrentOrderTemplateLineItems, {
        id: In(ids),
      });
    }
    await dataSource.destroy();
    ctx.request.body = ctx.request.body.data;
    return super.bulkInsert(ctx, next, RecurrentOrderTemplateLineItems);
  }

  async getRecurrentOrderTemplateLineItems(ctx: Context, next: Next) {
    return super.getAll(ctx, next, RecurrentOrderTemplateLineItems);
  }

  async getRecurrentOrderTemplateLineItemsBy(ctx: Context, next: Next) {
    return super.getBy(ctx, next, RecurrentOrderTemplateLineItems);
  }

  async addRecurrentOrderTemplateLineItems(ctx: Context, next: Next) {
    return super.insert(
      ctx,
      next,
      RecurrentOrderTemplateLineItems,
      RecurrentOrderTemplateLineItemsHistorical,
    );
  }

  async bulkaddRecurrentOrderTemplateLineItems(ctx: Context, next: Next) {
    ctx.request.body = ctx.request.body.data;
    return super.bulkInsert(
      ctx,
      next,
      RecurrentOrderTemplateLineItems,
      RecurrentOrderTemplateLineItemsHistorical,
    );
  }

  async updateRecurrentOrderTemplateLineItems(ctx: Context, next: Next) {
    return super.update(
      ctx,
      next,
      RecurrentOrderTemplateLineItems,
      RecurrentOrderTemplateLineItemsHistorical,
    );
  }

  async deleteRecurrentOrderTemplateLineItems(ctx: Context, next: Next) {
    return super.delete(
      ctx,
      next,
      RecurrentOrderTemplateLineItems,
      RecurrentOrderTemplateLineItemsHistorical,
    );
  }
}
