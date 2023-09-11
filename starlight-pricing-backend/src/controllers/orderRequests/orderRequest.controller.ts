import { Next } from 'koa';
import { OrderRequests } from '../../database/entities/tenant/OrderRequests';
import { Context } from '../../Interfaces/Auth';
import { BaseController } from '../base.controller';

export class OrderRequestController extends BaseController {
  async getOrderRequests(ctx: Context, next: Next) {
    return super.getAll(ctx, next, OrderRequests);
  }

  async getOrderRequestsBy(ctx: Context, next: Next) {
    return super.getBy(ctx, next, OrderRequests);
  }

  async addOrderRequests(ctx: Context, next: Next) {
    return super.insert(ctx, next, OrderRequests);
  }

  async updateOrderRequests(ctx: Context, next: Next) {
    return super.update(ctx, next, OrderRequests);
  }

  async deleteOrderRequests(ctx: Context, next: Next) {
    return super.delete(ctx, next, OrderRequests);
  }
}
