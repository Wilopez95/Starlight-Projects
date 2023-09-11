"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require("koa-router");
const subscriptionsPeriods_controller_1 = require("../../controllers/subscriptionsPeriods/subscriptionsPeriods.controller");
const authorized_1 = require("../../middlewares/authorized");
const validate_1 = require("./validate");
const validate_2 = require("../../middlewares/validate");
const controller = new subscriptionsPeriods_controller_1.SubscriptionsPeriodsController();
const router = new Router();
router.get("/by", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.updateSubscriptionsPeriodsSchema), controller.getSubscriptionsPeriodBy);
router.get("/", (0, authorized_1.authorized)([]), controller.getSubscriptionsPeriods);
router.post("/", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.createSubscriptionsPeriodsSchema), controller.addSubscriptionsPeriods);
router.put("/", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.updateSubscriptionsPeriodsSchema), controller.updateSubscriptionsPeriods);
router.delete("/", (0, authorized_1.authorized)([]), controller.deleteSubscriptionsPeriods);
exports.default = router.routes();
//# sourceMappingURL=subscriptionsPeriods.routes.js.map