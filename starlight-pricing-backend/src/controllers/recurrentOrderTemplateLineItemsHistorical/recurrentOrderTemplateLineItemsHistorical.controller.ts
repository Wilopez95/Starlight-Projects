import { Next } from 'koa';
import { RecurrentOrderTemplateLineItemsHistorical } from '../../database/entities/tenant/RecurrentOrderTemplateLineItemsHistorical';
import { Context } from '../../Interfaces/Auth';
import { BaseController } from '../base.controller';

export class RecurrentOrderTemplateLineItemsHistoricalController extends BaseController {
  async getRecurrentOrderTemplateLineItemsHistorical(ctx: Context, next: Next) {
    return super.getAll(ctx, next, RecurrentOrderTemplateLineItemsHistorical);
  }

  async getRecurrentOrderTemplateLineItemsHistoricalBy(ctx: Context, next: Next) {
    return super.getBy(ctx, next, RecurrentOrderTemplateLineItemsHistorical);
  }

  async addRecurrentOrderTemplateLineItemsHistorical(ctx: Context, next: Next) {
    return super.insert(ctx, next, RecurrentOrderTemplateLineItemsHistorical);
  }

  async updateRecurrentOrderTemplateLineItemsHistorical(ctx: Context, next: Next) {
    return super.update(ctx, next, RecurrentOrderTemplateLineItemsHistorical);
  }

  async deleteRecurrentOrderTemplateLineItemsHistorical(ctx: Context, next: Next) {
    return super.delete(ctx, next, RecurrentOrderTemplateLineItemsHistorical);
  }
}
