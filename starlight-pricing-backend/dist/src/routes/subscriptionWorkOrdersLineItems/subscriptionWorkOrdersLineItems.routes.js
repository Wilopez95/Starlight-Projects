"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require("koa-router");
const subscriptionWorkOrdersLineItems_controller_1 = require("../../controllers/subscriptionWorkOrdersLineItems/subscriptionWorkOrdersLineItems.controller");
const authorized_1 = require("../../middlewares/authorized");
const controller = new subscriptionWorkOrdersLineItems_controller_1.SubscriptionWorkOrdersLineItemsController();
const router = new Router();
router.put("/upsert", (0, authorized_1.authorized)([]), controller.upsertSubscriptionOrderMedia);
exports.default = router.routes();
//# sourceMappingURL=subscriptionWorkOrdersLineItems.routes.js.map