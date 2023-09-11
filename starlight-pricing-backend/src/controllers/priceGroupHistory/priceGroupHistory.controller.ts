import { Next } from 'koa';
import { PriceGroupsHistorical } from '../../database/entities/tenant/PriceGroupsHistorical';
import { Context } from '../../Interfaces/Auth';
import { BaseController } from '../base.controller';

export class PriceGroupHistoricalController extends BaseController {
  async getPriceGroupHistorical(ctx: Context, next: Next) {
    return super.getAll(ctx, next, PriceGroupsHistorical);
  }

  async getPriceGroupHistoricalBy(ctx: Context, next: Next) {
    return super.getBy(ctx, next, PriceGroupsHistorical);
  }
}
