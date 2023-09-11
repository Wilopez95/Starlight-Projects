"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoicesController = void 0;
const base_controller_1 = require("../base.controller");
const billingProcessor = require("../../services/billingProcessor/billingProcessor");
const ordersToInvoice = require("../../services/billingProcessor/ordersToInvoiceProcesor");
class InvoicesController extends base_controller_1.BaseController {
    constructor() {
        super();
    }
    getInvoicingOrdersCount(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const ordersCount = yield ordersToInvoice.getOrdersToInvoice(ctx, true);
            ctx.body = { total: ordersCount };
            return ctx.body;
        });
    }
    getInvoicingSubscriptionsOrdersCount(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const ordersCount = yield ordersToInvoice.getOrdersToInvoice(ctx, true);
            const subscriptionsCount = yield ordersToInvoice.getSubscriptionsToInvoice(ctx, true);
            const result = {
                ordersCount: ordersCount,
                subscriptionsCount,
            };
            ctx.body = result;
        });
    }
    runOrdersInvoicing(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const groupedResult = yield billingProcessor.generateOrdersDrafts(ctx);
            ctx.status = 200;
            ctx.body = groupedResult;
        });
    }
    runOrdersSubscriptionInvoicing(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const groupedResult = yield billingProcessor.generateDrafts(ctx);
            ctx.status = 200;
            ctx.body = groupedResult;
        });
    }
}
exports.InvoicesController = InvoicesController;
//# sourceMappingURL=invoices.controller.js.map