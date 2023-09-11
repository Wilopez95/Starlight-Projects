"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require("koa-router");
const authorized_1 = require("../../middlewares/authorized");
const validate_1 = require("./validate");
const validate_2 = require("../../middlewares/validate");
const subscriptionWorkOrder_controller_1 = require("../../controllers/subscriptionWorkOrder/subscriptionWorkOrder.controller");
const controller = new subscriptionWorkOrder_controller_1.SubscriptionWorkOrderController();
const router = new Router();
router.get("/by", (0, authorized_1.authorized)([]), controller.getSubscriptionWorkOrdersBy);
// router.get("/", authorized([]), controller.getSubscriptionWorkOrders);
router.get("/count", (0, authorized_1.authorized)([]), controller.count);
router.get("/countJoin", (0, authorized_1.authorized)([]), controller.countJoin);
router.get("/countStatus", (0, authorized_1.authorized)([]), controller.countStatus);
router.get("/subscriptionByStatus", (0, authorized_1.authorized)([]), controller.getSubscriptionByStatus);
router.get("/sequenceCount", (0, authorized_1.authorized)([]), controller.getSequenceCount);
router.post("/bulk", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.bulkCreateSubscriptionOrder), controller.bulkaddSubscriptionWorkOrders);
router.post("/updateBySubscriptionOrderId", (0, authorized_1.authorized)([]), controller.updateStatusBySubscriptionsOrdersIds);
router.put("/softDelete", (0, authorized_1.authorized)([]), controller.softDeleteBy);
router.put("/update/status", (0, authorized_1.authorized)([]), controller.updateStatus);
router.put("/:id", (0, authorized_1.authorized)([]), controller.updateSubscriptionWorkOrder);
router.put("/updateMany", (0, authorized_1.authorized)([]), controller.updateManySubscriptionWorkOrder);
exports.default = router.routes();
//# sourceMappingURL=subscriptionWorkOrder.routes.js.map