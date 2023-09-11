"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require("koa-router");
const subscriptionServiceItems_controller_1 = require("../../controllers/subscriptionServiceItems/subscriptionServiceItems.controller");
const authorized_1 = require("../../middlewares/authorized");
const validate_1 = require("./validate");
const validate_2 = require("../../middlewares/validate");
const controller = new subscriptionServiceItems_controller_1.SubscriptionServiceItemsController();
const router = new Router();
router.get("/by", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.updateSubscriptionsServiceItem), controller.getSubscriptionServiceItemBy);
router.get("/byId", (0, authorized_1.authorized)([]), 
// validate(updateSubscriptionsServiceItem),
controller.getSubscriptionServiceItemById);
router.get("/routePlanner", (0, authorized_1.authorized)([]), 
// validate(updateSubscriptionsServiceItem),
controller.getDetailsForRoutePlanner);
router.get("/getItemBySpecificDate", (0, authorized_1.authorized)([]), 
// validate(updateSubscriptionsServiceItem),
controller.getItemBySpecificDate);
router.get("/getNextItemBySpecificDate", (0, authorized_1.authorized)([]), 
// validate(updateSubscriptionsServiceItem),
controller.getNextItemBySpecificDate);
router.get("/", (0, authorized_1.authorized)([]), controller.getSubscriptionServiceItems);
router.post("/", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.createSubscriptionsServiceItem), controller.addSubscriptionServiceItem);
router.post("/bulk", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.bulkCreateSubscriptionsServiceItem), controller.bulkaddSubscriptionServiceItem);
router.post("/upsert", (0, authorized_1.authorized)([]), controller.upsertSubscriptionServiceItems);
router.put("/:id", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.updateSubscriptionsServiceItem), controller.updateSubscriptionServiceItem);
router.delete("/", (0, authorized_1.authorized)([]), controller.deleteSubscriptionServiceItem);
// get line items just ids
router.get("/:id/ids", (0, authorized_1.authorized)([]), controller.getSubscriptionServiceItemIds);
exports.default = router.routes();
//# sourceMappingURL=subscriptionServiceItem.routes.js.map