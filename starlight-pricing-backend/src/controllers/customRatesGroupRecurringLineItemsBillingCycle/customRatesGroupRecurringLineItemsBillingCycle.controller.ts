import { Next } from 'koa';
import { CustomRatesGroupRecurringLineItemBillingCycle } from '../../database/entities/tenant/CustomRatesGroupRecurringLineItemBillingCycle';
import { CustomRatesGroupRecurringLineItemBillingCycleHistorical } from '../../database/entities/tenant/CustomRatesGroupRecurringLineItemBillingCycleHistorical';
import { Context } from '../../Interfaces/Auth';
import { BaseController } from '../base.controller';

export class CustomRatesGroupRecurringLineItemBillingCycleController extends BaseController {
  async getCustomRatesRecurringLineItemBillingCycle(ctx: Context, next: Next) {
    return super.getAll(ctx, next, CustomRatesGroupRecurringLineItemBillingCycle);
  }

  async getCustomRatesRecurringLineItemBillingCycleBy(ctx: Context, next: Next) {
    return super.getBy(ctx, next, CustomRatesGroupRecurringLineItemBillingCycle);
  }

  async addCustomRatesRecurringLineItemBillingCycle(ctx: Context, next: Next) {
    return super.insert(
      ctx,
      next,
      CustomRatesGroupRecurringLineItemBillingCycle,
      CustomRatesGroupRecurringLineItemBillingCycleHistorical,
    );
  }

  async updateCustomRatesRecurringLineItemBillingCycle(ctx: Context, next: Next) {
    return super.update(
      ctx,
      next,
      CustomRatesGroupRecurringLineItemBillingCycle,
      CustomRatesGroupRecurringLineItemBillingCycleHistorical,
    );
  }
}
