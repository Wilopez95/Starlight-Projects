"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require("koa-router");
const subscriptionOrderMedia_controller_1 = require("../../controllers/subscriptionOrderMedia/subscriptionOrderMedia.controller");
const authorized_1 = require("../../middlewares/authorized");
const controller = new subscriptionOrderMedia_controller_1.SubscriptionOrderMediaController();
const router = new Router();
router.put("/upsert", (0, authorized_1.authorized)([]), controller.upsertSubscriptionOrderMedia);
router.post("/createFromUrl", (0, authorized_1.authorized)([]), controller.createOneFromUrl);
exports.default = router.routes();
//# sourceMappingURL=subscriptionOrderMedia.routes.js.map