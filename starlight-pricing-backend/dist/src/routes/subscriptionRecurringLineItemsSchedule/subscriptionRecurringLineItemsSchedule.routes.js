"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require("koa-router");
const subscriptionRecurringLineItemsSchedule_controller_1 = require("../../controllers/subscriptionRecurringLineItemsSchedule/subscriptionRecurringLineItemsSchedule.controller");
const authorized_1 = require("../../middlewares/authorized");
const validate_1 = require("./validate");
const validate_2 = require("../../middlewares/validate");
const controller = new subscriptionRecurringLineItemsSchedule_controller_1.SubscriptionRecurringLineItemsSchedulesController();
const router = new Router();
router.get("/by", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.updateSubscriptionsRecurrenigLineItemsSchedule), controller.getSubscriptionRecurringLineItemsScheduleBy);
router.get("/", (0, authorized_1.authorized)([]), controller.getSubscriptionRecurringLineItemsSchedules);
router.post("/", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.createSubscriptionsRecurrenigLineItemsSchedule), controller.addSubscriptionRecurringLineItemsSchedules);
router.put("/", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.updateSubscriptionsRecurrenigLineItemsSchedule), controller.updateSubscriptionRecurringLineItemsSchedules);
router.delete("/", (0, authorized_1.authorized)([]), controller.deleteSubscriptionRecurringLineItemsSchedules);
exports.default = router.routes();
//# sourceMappingURL=subscriptionRecurringLineItemsSchedule.routes.js.map