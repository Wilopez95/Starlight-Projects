"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require("koa-router");
const customRatesGroupRecurringLineItemsBillingCycleHistorical_controller_1 = require("../../controllers/customRatesGroupRecurringLineItemsBillingCycleHistorical/customRatesGroupRecurringLineItemsBillingCycleHistorical.controller");
const validate_1 = require("./validate");
const authorized_1 = require("../../middlewares/authorized");
const validate_2 = require("../../middlewares/validate");
const controller = new customRatesGroupRecurringLineItemsBillingCycleHistorical_controller_1.CustomRatesGroupRecurringLineItemBillingCycleHistoricalController();
const router = new Router();
router.get("/by", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.updateCustomRatesGroupRecurringLineItemsBillingCycleHistoricalSchema), controller.getCustomRatesRecurringLineItemBillingCycleHistoricalBy);
router.get("/", (0, authorized_1.authorized)([]), controller.getCustomRatesRecurringLineItemBillingCycleHistorical);
router.post("/", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.createCustomRatesGroupRecurringLineItemsBillingCycleHistoricalSchema), controller.addCustomRatesRecurringLineItemBillingCycleHistorical);
exports.default = router.routes();
//# sourceMappingURL=customRatesGroupRecurringLineItemsBillingCycleHistorical.routes.js.map