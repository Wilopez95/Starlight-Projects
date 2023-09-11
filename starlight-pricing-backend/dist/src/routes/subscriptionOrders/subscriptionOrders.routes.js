"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require("koa-router");
const subscriptionOrders_controller_1 = require("../../controllers/subscriptionOrders/subscriptionOrders.controller");
const authorized_1 = require("../../middlewares/authorized");
const validate_1 = require("./validate");
const validate_2 = require("../../middlewares/validate");
const controller = new subscriptionOrders_controller_1.SubscriptionOrdersController();
const router = new Router();
router.get("/by", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.updateSubscriptionOrder), controller.getSubscriptionOrdersBy);
router.get("/", (0, authorized_1.authorized)([]), controller.getSubscriptionOrders);
router.get("/bySubscriptionsIds", (0, authorized_1.authorized)([]), controller.getBySubscriptionIds);
router.get("/count", (0, authorized_1.authorized)([]), controller.getSubscriptionOrdersCount);
router.get("/sequenceCount", (0, authorized_1.authorized)([]), controller.getSequenceCount);
router.post("/", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.createSubscriptionOrder), controller.addSubscriptionOrders);
router.post("/bulk", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.bulkCreateSubscriptionOrder), controller.bulkaddSubscriptionOrders);
router.put("/:subscriptionId/update", (0, authorized_1.authorized)([]), controller.updateSubscriptionOrdersBySubsId);
router.put("/:id", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.updateSubscriptionOrder), controller.updateSubscriptionOrders);
router.delete("/", (0, authorized_1.authorized)([]), controller.deleteSubscriptionOrders);
router.get("/:subscriptionId/orders/", (0, authorized_1.authorized)([]), controller.getSubscriptionOrdersPaginated);
router.get("/:subscriptionId/orders/", (0, authorized_1.authorized)([]), controller.getSubscriptionOrdersPaginated);
router.get("/:id", (0, authorized_1.authorized)([]), controller.getById);
router.get("/:id/nextService", (0, authorized_1.authorized)([]), controller.getNextServiceDateBySubscriptionId);
router.get("/allByIds", (0, authorized_1.authorized)([]), controller.getAllByIds);
router.post("/softDelete", (0, authorized_1.authorized)([]), controller.softDeleteBy);
router.post("/updateStatusByIds", (0, authorized_1.authorized)([]), controller.updateStatusByIds);
//ToDo add Validation
router.patch("/validate", controller.validateOrders);
exports.default = router.routes();
//# sourceMappingURL=subscriptionOrders.routes.js.map