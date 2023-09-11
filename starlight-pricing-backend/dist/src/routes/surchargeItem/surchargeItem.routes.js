"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require("koa-router");
const surchargeItem_controller_1 = require("../../controllers/surchargeItem/surchargeItem.controller");
const authorized_1 = require("../../middlewares/authorized");
const validate_1 = require("./validate");
const validate_2 = require("../../middlewares/validate");
const controller = new surchargeItem_controller_1.SurchargeItemController();
const router = new Router();
router.get("/by", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.updateSurchargeItemSchema), controller.getSurchargeItemBy);
router.get("/", (0, authorized_1.authorized)([]), controller.getSurchargeItems);
router.post("/", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.createSurchargeItemSchema), controller.addSurchargeItem);
router.post("/bulk", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.bulkCreateSurchargeItemSchema), controller.bulkAddSurchargeItem);
router.post("/upsert", (0, authorized_1.authorized)([]), controller.upsertSurchargeItem);
router.put("/", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.updateSurchargeItemSchema), controller.updateSurchargeItem);
router.delete("/", (0, authorized_1.authorized)([]), controller.deleteSurchargeItem);
exports.default = router.routes();
//# sourceMappingURL=surchargeItem.routes.js.map