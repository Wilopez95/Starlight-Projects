"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require("koa-router");
const thresholdItems_controller_1 = require("../../controllers/thresholdItems/thresholdItems.controller");
const authorized_1 = require("../../middlewares/authorized");
const validate_1 = require("./validate");
const validate_2 = require("../../middlewares/validate");
const controller = new thresholdItems_controller_1.ThresholdItemsController();
const router = new Router();
router.get("/by", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.updateThresholdItemSchema), controller.getThresholdItemBy);
router.get("/", (0, authorized_1.authorized)([]), controller.getThresholdItems);
router.post("/", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.createThresholdItemSchema), controller.addThresholdItems);
router.post("/upsert", (0, authorized_1.authorized)([]), controller.upsertThresholdItems);
router.post("/bulk", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.bulkCreateThresholdItemSchema), controller.bulkAddThresholdItems);
router.put("/", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.updateThresholdItemSchema), controller.updateThresholdItems);
router.delete("/", (0, authorized_1.authorized)([]), controller.deleteThresholdItems);
exports.default = router.routes();
//# sourceMappingURL=thresholdItems.routes.js.map