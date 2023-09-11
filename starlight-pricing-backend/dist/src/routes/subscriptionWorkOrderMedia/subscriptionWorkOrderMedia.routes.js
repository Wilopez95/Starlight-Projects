"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require("koa-router");
const subscriptionWorkOrderMedia_controller_1 = require("../../controllers/subscriptionWorkOrderMedia/subscriptionWorkOrderMedia.controller");
const authorized_1 = require("../../middlewares/authorized");
const controller = new subscriptionWorkOrderMedia_controller_1.SubscriptionWorkOrderMediaController();
const router = new Router();
router.put("/upsert", (0, authorized_1.authorized)([]), controller.upsertSubscriptionOrderMedia);
router.post("/createFromUrl", (0, authorized_1.authorized)([]), controller.createOneFromUrl);
router.get("/:id", (0, authorized_1.authorized)([]), controller.getData);
exports.default = router.routes();
//# sourceMappingURL=subscriptionWorkOrderMedia.routes.js.map