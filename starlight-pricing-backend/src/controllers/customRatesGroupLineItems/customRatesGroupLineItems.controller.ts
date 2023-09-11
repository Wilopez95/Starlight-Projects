import { Next } from 'koa';
import { CustomRatesGroupLineItems } from '../../database/entities/tenant/CustomRatesGroupLineItems';
import { CustomRatesGroupLineItemsHistorical } from '../../database/entities/tenant/CustomRatesGroupLineItemsHistorical';
import { Context } from '../../Interfaces/Auth';
import { BaseController } from '../base.controller';

export class CustomRatesGroupLineItemsController extends BaseController {
  async getCustomerRatesGroupLineItems(ctx: Context, next: Next) {
    return super.getAll(ctx, next, CustomRatesGroupLineItems);
  }

  async getCustomerRatesGroupLineItemsBy(ctx: Context, next: Next) {
    return super.getBy(ctx, next, CustomRatesGroupLineItems);
  }

  async addCustomerRatesGroupLineItems(ctx: Context, next: Next) {
    return super.insert(ctx, next, CustomRatesGroupLineItems, CustomRatesGroupLineItemsHistorical);
  }

  async updateCustomerRatesGroupLineItems(ctx: Context, next: Next) {
    return super.update(ctx, next, CustomRatesGroupLineItems, CustomRatesGroupLineItemsHistorical);
  }
}
