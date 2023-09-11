import { Next } from 'koa';
import { CustomRatesGroupSurcharges } from '../../database/entities/tenant/CustomRatesGroupSurcharges';
import { CustomRatesGroupSurchargesHistorical } from '../../database/entities/tenant/CustomRatesGroupSurchargesHistorical';
import { Context } from '../../Interfaces/Auth';
import { BaseController } from '../base.controller';

export class CustomRatesGroupSurchargesController extends BaseController {
  async addCustomRatesGroupSurcharges(ctx: Context, next: Next) {
    return super.insert(
      ctx,
      next,
      CustomRatesGroupSurcharges,
      CustomRatesGroupSurchargesHistorical,
    );
  }

  async updateCustomRatesGroupSurcharges(ctx: Context, next: Next) {
    const id: number = +ctx.url.split('/')[2];
    return super.update(
      ctx,
      next,
      CustomRatesGroupSurcharges,
      CustomRatesGroupSurchargesHistorical,
      id,
    );
  }
}
