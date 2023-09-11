import { Next } from 'koa';
import { CustomRatesGroupLineItemsHistorical } from '../../database/entities/tenant/CustomRatesGroupLineItemsHistorical';
import { Context } from '../../Interfaces/Auth';
import { BaseController } from '../base.controller';

export class CustomRatesGroupLineItemsHistoricalController extends BaseController {
  async getCustomerRatesGroupLineItemsHistorical(ctx: Context, next: Next) {
    return super.getAll(ctx, next, CustomRatesGroupLineItemsHistorical);
  }

  async getCustomerRatesGroupLineItemsHistoricalBy(ctx: Context, next: Next) {
    return super.getBy(ctx, next, CustomRatesGroupLineItemsHistorical);
  }

  async addCustomerRatesGroupLineItemsHistorical(ctx: Context, next: Next) {
    return super.insert(ctx, next, CustomRatesGroupLineItemsHistorical);
  }
}
