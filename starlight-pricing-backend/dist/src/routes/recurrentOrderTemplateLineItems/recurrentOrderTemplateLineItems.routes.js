"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require("koa-router");
const recurrentOrderTemplateLineItems_controller_1 = require("../../controllers/recurrentOrderTemplateLineItems/recurrentOrderTemplateLineItems.controller");
const authorized_1 = require("../../middlewares/authorized");
const validate_1 = require("./validate");
const validate_2 = require("../../middlewares/validate");
const controller = new recurrentOrderTemplateLineItems_controller_1.RecurrentOrderTemplateLineItemsController();
const router = new Router();
router.get("/by", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.updateRecurrentOrderTemplateLineItems), controller.getRecurrentOrderTemplateLineItemsBy);
router.get("/", (0, authorized_1.authorized)([]), controller.getRecurrentOrderTemplateLineItems);
router.post("/upsert", (0, authorized_1.authorized)([]), controller.upsertOrderTemplateLineItem);
router.post("/", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.createRecurrentOrderTemplateLineItems), controller.addRecurrentOrderTemplateLineItems);
router.post("/bulk", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.bulkCreateRecurrentOrderTemplateLineItemsSchema), controller.bulkaddRecurrentOrderTemplateLineItems);
router.put("/", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.updateRecurrentOrderTemplateLineItems), controller.updateRecurrentOrderTemplateLineItems);
router.delete("/", (0, authorized_1.authorized)([]), controller.deleteRecurrentOrderTemplateLineItems);
exports.default = router.routes();
//# sourceMappingURL=recurrentOrderTemplateLineItems.routes.js.map