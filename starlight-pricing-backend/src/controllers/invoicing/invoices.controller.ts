import { BaseController } from '../base.controller';
import * as billingProcessor from '../../services/billingProcessor/billingProcessor';
import * as ordersToInvoice from '../../services/billingProcessor/ordersToInvoiceProcesor';
import { Context } from '../../Interfaces/Auth';

export class InvoicesController extends BaseController {
  async getInvoicingOrdersCount(ctx: Context) {
    const ordersCount = await ordersToInvoice.getOrdersToInvoice(ctx, true);
    ctx.body = { total: ordersCount };
    return ctx.body;
  }

  async getInvoicingSubscriptionsOrdersCount(ctx: Context) {
    const ordersCount = await ordersToInvoice.getOrdersToInvoice(ctx, true);
    const subscriptionsCount = await ordersToInvoice.getSubscriptionsToInvoice(ctx, true);

    const result = {
      ordersCount,
      subscriptionsCount,
    };
    ctx.body = result;
  }

  async runOrdersInvoicing(ctx: Context) {
    const groupedResult = await billingProcessor.generateOrdersDrafts(ctx);

    ctx.status = 200;
    ctx.body = groupedResult;
  }

  async runOrdersSubscriptionInvoicing(ctx: Context) {
    const groupedResult = await billingProcessor.generateDrafts(ctx);

    ctx.status = 200;
    ctx.body = groupedResult;
  }
}
