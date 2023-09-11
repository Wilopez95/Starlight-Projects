import { Next } from 'koa';
import { CustomRatesGroupRecurringServiceFrequencyHistorical } from '../../database/entities/tenant/CustomRatesGroupRecurringServiceFrequencyHistorical';
import { Context } from '../../Interfaces/Auth';
import { BaseController } from '../base.controller';

export class CustomRatesGroupRecurringServiceFrequencyHistoricalController extends BaseController {
  async getCustomRatesGroupRecurringServiceFrequencyHistorical(ctx: Context, next: Next) {
    return super.getAll(ctx, next, CustomRatesGroupRecurringServiceFrequencyHistorical);
  }

  async getCustomRatesGroupRecurringServiceFrequencyHistoricalBy(ctx: Context, next: Next) {
    return super.getBy(ctx, next, CustomRatesGroupRecurringServiceFrequencyHistorical);
  }

  async addCustomRatesGroupRecurringServiceFrequencyHistorical(ctx: Context, next: Next) {
    return super.insert(ctx, next, CustomRatesGroupRecurringServiceFrequencyHistorical);
  }
}
