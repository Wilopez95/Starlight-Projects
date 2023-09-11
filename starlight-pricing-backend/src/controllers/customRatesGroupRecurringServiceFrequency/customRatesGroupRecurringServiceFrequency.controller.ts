import { Next } from 'koa';
import { CustomRatesGroupRecurringServiceFrequency } from '../../database/entities/tenant/CustomRatesGroupRecurringServiceFrequency';
import { CustomRatesGroupRecurringServiceFrequencyHistorical } from '../../database/entities/tenant/CustomRatesGroupRecurringServiceFrequencyHistorical';
import { Context } from '../../Interfaces/Auth';
import { BaseController } from '../base.controller';

export class CustomRatesGroupRecurringServiceFrequencyController extends BaseController {
  async getCustomRatesGroupRecurringServiceFrequency(ctx: Context, next: Next) {
    return super.getAll(ctx, next, CustomRatesGroupRecurringServiceFrequency);
  }

  async getCustomRatesGroupRecurringServiceFrequencyBy(ctx: Context, next: Next) {
    return super.getBy(ctx, next, CustomRatesGroupRecurringServiceFrequency);
  }

  async addCustomRatesGroupRecurringServiceFrequency(ctx: Context, next: Next) {
    return super.insert(
      ctx,
      next,
      CustomRatesGroupRecurringServiceFrequency,
      CustomRatesGroupRecurringServiceFrequencyHistorical,
    );
  }

  async updateCustomRatesGroupRecurringServiceFrequency(ctx: Context, next: Next) {
    return super.update(
      ctx,
      next,
      CustomRatesGroupRecurringServiceFrequency,
      CustomRatesGroupRecurringServiceFrequencyHistorical,
    );
  }
}
