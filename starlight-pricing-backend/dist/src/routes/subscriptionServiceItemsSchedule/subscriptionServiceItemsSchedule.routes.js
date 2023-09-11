"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require("koa-router");
const subscriptionServiceItemsSchedule_controller_1 = require("../../controllers/subscriptionServiceItemsSchedule/subscriptionServiceItemsSchedule.controller");
const authorized_1 = require("../../middlewares/authorized");
const validate_1 = require("./validate");
const validate_2 = require("../../middlewares/validate");
const controller = new subscriptionServiceItemsSchedule_controller_1.SubscriptionServiceItemsSchedulesController();
const router = new Router();
router.get("/by", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.updateSubscriptionsServiceItemsSchedule), controller.getSubscriptionServiceItemsScheduleBy);
router.get("/", (0, authorized_1.authorized)([]), controller.getSubscriptionServiceItemsSchedules);
router.post("/", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.createSubscriptionsServiceItemsSchedule), controller.addSubscriptionServiceItemsSchedules);
router.put("/", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.updateSubscriptionsServiceItemsSchedule), controller.updateSubscriptionServiceItemsSchedules);
router.delete("/", (0, authorized_1.authorized)([]), controller.deleteSubscriptionServiceItemsSchedules);
exports.default = router.routes();
//# sourceMappingURL=subscriptionServiceItemsSchedule.routes.js.map