"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require("koa-router");
const subscriptionHistory_controller_1 = require("../../controllers/subscriptionHistory/subscriptionHistory.controller");
const authorized_1 = require("../../middlewares/authorized");
const validate_1 = require("./validate");
const validate_2 = require("../../middlewares/validate");
const controller = new subscriptionHistory_controller_1.SubscriptionHistoryController();
const router = new Router();
router.get("/by", (0, authorized_1.authorized)([]), 
//   validate(updateSubscriptionOrder),
controller.getSubscriptionHistoryBy);
router.get("/:id/history", (0, authorized_1.authorized)([]), controller.getSubscriptionHistory);
router.post("/", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.createSubscriptionHistorySchema), controller.addSubscriptionHistory);
router.put("/:id", (0, authorized_1.authorized)([]), 
//   validate(updateSubscriptionOrder),
controller.updateSubscriptionHistory);
router.delete("/", (0, authorized_1.authorized)([]), controller.deleteSubscriptionHistory);
exports.default = router.routes();
//# sourceMappingURL=subscriptionHistory.routes.js.map