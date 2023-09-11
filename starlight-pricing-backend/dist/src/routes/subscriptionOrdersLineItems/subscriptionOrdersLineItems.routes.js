"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require("koa-router");
const subscriptionOrdersLineItems_controller_1 = require("../../controllers/subscriptionOrdersLineItems/subscriptionOrdersLineItems.controller");
const authorized_1 = require("../../middlewares/authorized");
const validate_1 = require("./validate");
const validate_2 = require("../../middlewares/validate");
const controller = new subscriptionOrdersLineItems_controller_1.SubscriptionOrdersLineItemsController();
const router = new Router();
router.get("/by", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.updateSubscriptionsPeriodsController), controller.getSubscriptionOrdersLineItemBy);
router.get("/", (0, authorized_1.authorized)([]), controller.getSubscriptionOrdersLineItems);
router.post("/", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.createSubscriptionsPeriodsController), controller.addSubscriptionOrdersLineItems);
router.put("/", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.updateSubscriptionsPeriodsController), controller.updateSubscriptionOrdersLineItems);
router.delete("/", (0, authorized_1.authorized)([]), controller.deleteSubscriptionOrdersLineItems);
router.post("/bulk", (0, authorized_1.authorized)([]), 
//validate(createSubscriptionsPeriodsController),
controller.bulkAddSubscriptionOrdersLineItems);
router.post('/upsert', (0, authorized_1.authorized)([]), controller.upsertSubscriptionOrdersLineItems);
exports.default = router.routes();
//# sourceMappingURL=subscriptionOrdersLineItems.routes.js.map