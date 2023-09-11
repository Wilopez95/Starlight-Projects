import { Next } from 'koa';
import { CustomRatesGroupThresholds } from '../../database/entities/tenant/CustomRatesGroupThresholds';
import { CustomRatesGroupThresholdsHistorical } from '../../database/entities/tenant/CustomRatesGroupThresholdsHistorical';
import { Context } from '../../Interfaces/Auth';
import { BaseController } from '../base.controller';

export class CustomRatesGroupThresholdsController extends BaseController {
  async addCustomRatesGroupThresholds(ctx: Context, next: Next) {
    return super.insert(
      ctx,
      next,
      CustomRatesGroupThresholds,
      CustomRatesGroupThresholdsHistorical,
    );
  }

  async updateCustomRatesGroupThresholds(ctx: Context, next: Next) {
    const id: number = +ctx.url.split('/')[2];
    return super.update(
      ctx,
      next,
      CustomRatesGroupThresholds,
      CustomRatesGroupThresholdsHistorical,
      id,
    );
  }
}
