import { Next } from 'koa';
import { CustomRatesGroupServices } from '../../database/entities/tenant/CustomRatesGroupServices';
import { Context } from '../../Interfaces/Auth';
import { BaseController } from '../base.controller';

export class CustomRatesGroupServicesController extends BaseController {
  async getCustomRatesGroupServices(ctx: Context, next: Next) {
    return super.getAll(ctx, next, CustomRatesGroupServices);
  }

  async getCustomRatesRGroupServicesBy(ctx: Context, next: Next) {
    return super.getBy(ctx, next, CustomRatesGroupServices);
  }

  async addCustomRatesGroupServices(ctx: Context, next: Next) {
    return super.insert(ctx, next, CustomRatesGroupServices);
  }

  async updateCustomRatesGroupServices(ctx: Context, next: Next) {
    return super.update(ctx, next, CustomRatesGroupServices);
  }
}
