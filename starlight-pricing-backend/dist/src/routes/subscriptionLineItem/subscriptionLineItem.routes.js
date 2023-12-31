"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require("koa-router");
const subscriptionLineItem_controller_1 = require("../../controllers/subscriptionLineItem/subscriptionLineItem.controller");
const authorized_1 = require("../../middlewares/authorized");
const validate_1 = require("./validate");
const validate_2 = require("../../middlewares/validate");
const controller = new subscriptionLineItem_controller_1.SubscriptionLineItemController();
const router = new Router();
router.get("/by", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.updateSubscriptionsLineItem), controller.getSubscriptionLineItemBy);
router.get("/", (0, authorized_1.authorized)([]), controller.getSubscriptionLineItems);
router.get("/getItemBySpecificDate", (0, authorized_1.authorized)([]), controller.getItemBySpecificDate);
router.get("/getNextItemBySpecificDate", (0, authorized_1.authorized)([]), controller.getNextItemBySpecificDate);
router.post("/", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.createSubscriptionsLineItem), controller.addSubscriptionLineItem);
router.post("/bulk", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.bulkCreateSubscriptionsLineItem), controller.bulkaddSubscriptionLineItem);
router.post("/upsert", (0, authorized_1.authorized)([]), controller.upsertSubscriptionLineItems);
router.put("/:id", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.updateSubscriptionsLineItem), controller.updateSubscriptionLineItem);
router.delete("/", (0, authorized_1.authorized)([]), controller.deleteSubscriptionLineItem);
exports.default = router.routes();
//# sourceMappingURL=subscriptionLineItem.routes.js.map