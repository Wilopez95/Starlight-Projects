import { Next } from 'koa';
import { RecurrentOrderTemplateHistorical } from '../../database/entities/tenant/RecurrentOrderTemplatesHistorical';
import { Context } from '../../Interfaces/Auth';
import { BaseController } from '../base.controller';

export class RecurrentOrderTemplateHistoricalController extends BaseController {
  async getRecurrentOrderTemplateHistorical(ctx: Context, next: Next) {
    return super.getAll(ctx, next, RecurrentOrderTemplateHistorical);
  }

  async getRecurrentOrderTemplateHistoricalBy(ctx: Context, next: Next) {
    return super.getBy(ctx, next, RecurrentOrderTemplateHistorical);
  }

  async addRecurrentOrderTemplateHistorical(ctx: Context, next: Next) {
    return super.insert(ctx, next, RecurrentOrderTemplateHistorical);
  }

  async updateRecurrentOrderTemplateHistorical(ctx: Context, next: Next) {
    return super.update(ctx, next, RecurrentOrderTemplateHistorical);
  }

  async deleteRecurrentOrderTemplateHistorical(ctx: Context, next: Next) {
    return super.delete(ctx, next, RecurrentOrderTemplateHistorical);
  }
}
