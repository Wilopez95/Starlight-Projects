import { Next } from 'koa';
import { In } from 'typeorm';
import { OrderTaxDistrict } from '../../database/entities/tenant/OrderTaxDistrict';
import { Context } from '../../Interfaces/Auth';
import { IBody, IWhere } from '../../Interfaces/GeneralsFilter';
import { BaseController } from '../base.controller';

export class OrderTaxDistrictController extends BaseController {
  async getOrderTaxDistrict(ctx: Context, next: Next) {
    const orderId = ctx.request.body.id;
    const where: IWhere = {};
    const ids: number[] | null = ctx.request.body.ids;
    if (orderId) {
      where.orderId = orderId;
    }
    if (ids) {
      where.orderId = In(ids);
    }
    const body: IBody = {};
    body.where = where;
    ctx.request.body = body;
    return super.getBy(ctx, next, OrderTaxDistrict);
  }

  async getOrderTaxDistrictBy(ctx: Context, next: Next) {
    return super.getBy(ctx, next, OrderTaxDistrict);
  }

  async addOrderTaxDistrict(ctx: Context, next: Next) {
    return super.insert(ctx, next, OrderTaxDistrict);
  }

  async bulkAddOrderTaxDistrict(ctx: Context, next: Next) {
    ctx.request.body = ctx.request.body.data;
    return super.bulkInsert(ctx, next, OrderTaxDistrict);
  }
}
