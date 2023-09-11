"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require("koa-router");
const invoices_controller_1 = require("../../controllers/invoicing/invoices.controller");
const validate_1 = require("./validate");
const validate_2 = require("../../middlewares/validate");
const controller = new invoices_controller_1.InvoicesController();
const router = new Router();
router.post("/orders-subscriptions/run", controller.runOrdersSubscriptionInvoicing);
router.post("/run", controller.runOrdersInvoicing);
router.post("/count", (0, validate_2.validate)(validate_1.runInvoicingParams), controller.getInvoicingOrdersCount);
router.post("/count/subscriptions-orders", (0, validate_2.validate)(validate_1.subscriptionOrdersInvoicing), controller.getInvoicingSubscriptionsOrdersCount);
exports.default = router.routes();
//# sourceMappingURL=invoicing.routes.js.map