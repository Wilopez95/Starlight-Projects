import { Next } from 'koa';
import { OrderTaxDistrict } from '../../database/entities/tenant/OrderTaxDistrict';
import { Context } from '../../Interfaces/Auth';
import { BaseController } from '../base.controller';

export class OrderTaxDistrictTaxesController extends BaseController {
  async getOrderTaxDistrictTaxes(ctx: Context, next: Next) {
    return super.getAll(ctx, next, OrderTaxDistrict);
  }

  async getOrderTaxDistrictTaxesBy(ctx: Context, next: Next) {
    return super.getBy(ctx, next, OrderTaxDistrict);
  }

  async addOrderTaxDistrictTaxes(ctx: Context, next: Next) {
    return super.insert(ctx, next, OrderTaxDistrict);
  }
}
