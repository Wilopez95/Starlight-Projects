import { Next } from 'koa';
import { CustomRatesGroupRecurringLineItemBillingCycleHistorical } from '../../database/entities/tenant/CustomRatesGroupRecurringLineItemBillingCycleHistorical';
import { Context } from '../../Interfaces/Auth';
import { BaseController } from '../base.controller';

export class CustomRatesGroupRecurringLineItemBillingCycleHistoricalController extends BaseController {
  async getCustomRatesRecurringLineItemBillingCycleHistorical(ctx: Context, next: Next) {
    return super.getAll(ctx, next, CustomRatesGroupRecurringLineItemBillingCycleHistorical);
  }

  async getCustomRatesRecurringLineItemBillingCycleHistoricalBy(ctx: Context, next: Next) {
    return super.getBy(ctx, next, CustomRatesGroupRecurringLineItemBillingCycleHistorical);
  }

  async addCustomRatesRecurringLineItemBillingCycleHistorical(ctx: Context, next: Next) {
    return super.insert(ctx, next, CustomRatesGroupRecurringLineItemBillingCycleHistorical);
  }
}
