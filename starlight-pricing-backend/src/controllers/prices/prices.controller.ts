import { Next } from 'koa';
import { Prices } from '../../database/entities/tenant/Prices';
import { Context } from '../../Interfaces/Auth';
import { BaseController } from '../base.controller';

export class PriceController extends BaseController {
  async getPrice(ctx: Context, next: Next) {
    return super.getAll(ctx, next, Prices);
  }

  async getPriceBy(ctx: Context, next: Next) {
    return super.getBy(ctx, next, Prices);
  }

  async addPrice(ctx: Context, next: Next) {
    return super.insert(ctx, next, Prices);
  }

  async updatePrice(ctx: Context, next: Next) {
    return super.update(ctx, next, Prices);
  }

  async deletePrice(ctx: Context, next: Next) {
    return super.delete(ctx, next, Prices);
  }
}
