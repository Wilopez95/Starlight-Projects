"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require("koa-router");
const customRatesGroupRecurringLineItemsBillingCycle_controller_1 = require("../../controllers/customRatesGroupRecurringLineItemsBillingCycle/customRatesGroupRecurringLineItemsBillingCycle.controller");
const validate_1 = require("./validate");
const authorized_1 = require("../../middlewares/authorized");
const validate_2 = require("../../middlewares/validate");
const controller = new customRatesGroupRecurringLineItemsBillingCycle_controller_1.CustomRatesGroupRecurringLineItemBillingCycleController();
const router = new Router();
router.get("/by", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.updateCustomRatesGroupRecurringLineItemsBillingCycleSchema), controller.getCustomRatesRecurringLineItemBillingCycleBy);
router.get("/", (0, authorized_1.authorized)([]), controller.getCustomRatesRecurringLineItemBillingCycle);
router.post("/", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.createCustomRatesGroupRecurringLineItemsBillingCycleSchema), controller.addCustomRatesRecurringLineItemBillingCycle);
router.put("/", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.updateCustomRatesGroupRecurringLineItemsBillingCycleSchema), controller.updateCustomRatesRecurringLineItemBillingCycle);
// router.delete("/", authorized([]), controller.deleteLineItems);
exports.default = router.routes();
//# sourceMappingURL=customRatesGroupRecurringLineItemsBillingCycle.routes.js.map