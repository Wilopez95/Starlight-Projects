"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require("koa-router");
const subscriptionSurcharges_controller_1 = require("../../controllers/subscriptionSurchages/subscriptionSurcharges.controller");
const authorized_1 = require("../../middlewares/authorized");
const validate_1 = require("./validate");
const validate_2 = require("../../middlewares/validate");
const controller = new subscriptionSurcharges_controller_1.SubscriptionSurchargeItemController();
const router = new Router();
router.get("/by", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.updateSubscriptionSurcharge), controller.getSubscriptionSurchargeItemBy);
router.get("/", (0, authorized_1.authorized)([]), controller.getSubscriptionSurchargeItem);
router.post("/upsert", (0, authorized_1.authorized)([]), controller.upsertSubscriptionSurchargeItem);
router.post("/", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.createSubscriptionSurcharge), controller.addSubscriptionSurchargeItem);
router.put("/", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.updateSubscriptionSurcharge), controller.updateSubscriptionSurchargeItem);
router.delete("/", (0, authorized_1.authorized)([]), controller.deleteSubscriptionSurchargeItem);
exports.default = router.routes();
//# sourceMappingURL=subscriptionSurcharges.routes.js.map