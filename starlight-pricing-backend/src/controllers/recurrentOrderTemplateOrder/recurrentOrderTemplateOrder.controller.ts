import { Next } from 'koa';
import { DataSource } from 'typeorm';
import { RecurrentOrderTemplateOrder } from '../../database/entities/tenant/RecurrentOrderTemplateOrder';
import { BaseController } from '../base.controller';
import { ORDER_STATUS } from '../../consts/orderStatuses';
import { Context } from '../../Interfaces/Auth';
import { IcountNotFinalized } from '../../Interfaces/RecurrentOrderTemplate';

export class RecurrentOrderTemplateOrderController extends BaseController {
  async getRecurrentOrderTemplateOrder(ctx: Context, next: Next) {
    return super.getAll(ctx, next, RecurrentOrderTemplateOrder);
  }

  async getRecurrentOrderTemplateOrderBy(ctx: Context, next: Next) {
    return super.getBy(ctx, next, RecurrentOrderTemplateOrder);
  }

  async countNotFinalized(ctx: Context, next: Next) {
    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );
    const recurrentOrder = await dataSource
      .createQueryBuilder()
      .select('recurrentOrderTemplateOrder')
      .from(RecurrentOrderTemplateOrder, 'recurrentOrderTemplateOrder')
      .innerJoin('Orders', 'orders', 'orders.id = recurrentOrderTemplateOrder.orderId')
      .where(
        'recurrentOrderTemplateOrder.recurrentOrderTemplateId = :id',
        ctx.request.body as IcountNotFinalized,
      )
      .andWhere('orders.status IN (:...status)', {
        status: [ORDER_STATUS.inProgress, ORDER_STATUS.completed, ORDER_STATUS.approved],
      })
      .getCount();
    await dataSource.destroy();
    ctx.body = recurrentOrder;
    ctx.status = 200;
    return next();
  }

  async addRecurrentOrderTemplateOrder(ctx: Context, next: Next) {
    return super.insert(ctx, next, RecurrentOrderTemplateOrder);
  }

  async bulkAddRecurrentOrderTemplateOrder(ctx: Context, next: Next) {
    ctx.request.body = ctx.request.body.data;
    return super.bulkInsert(ctx, next, RecurrentOrderTemplateOrder);
  }

  async updateRecurrentOrderTemplateOrder(ctx: Context, next: Next) {
    return super.update(ctx, next, RecurrentOrderTemplateOrder);
  }

  async deleteRecurrentOrderTemplateOrder(ctx: Context, next: Next) {
    return super.delete(ctx, next, RecurrentOrderTemplateOrder);
  }
}
