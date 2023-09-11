"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require("koa-router");
const recurrentOrderTemplateOrder_controller_1 = require("../../controllers/recurrentOrderTemplateOrder/recurrentOrderTemplateOrder.controller");
const authorized_1 = require("../../middlewares/authorized");
const validate_1 = require("./validate");
const validate_2 = require("../../middlewares/validate");
const controller = new recurrentOrderTemplateOrder_controller_1.RecurrentOrderTemplateOrderController();
const router = new Router();
router.get("/by", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.updateRecurrentOrderTemplateOrder), controller.getRecurrentOrderTemplateOrderBy);
router.get("/", (0, authorized_1.authorized)([]), controller.getRecurrentOrderTemplateOrder);
router.get("/countNotFinalized", (0, authorized_1.authorized)([]), controller.countNotFinalized);
router.post("/", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.createRecurrentOrderTemplateOrder), controller.addRecurrentOrderTemplateOrder);
router.post("/bulk", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.bulkCreateRecurrentOrderTemplateOrder), controller.bulkAddRecurrentOrderTemplateOrder);
router.put("/", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.updateRecurrentOrderTemplateOrder), controller.updateRecurrentOrderTemplateOrder);
router.delete("/", (0, authorized_1.authorized)([]), controller.deleteRecurrentOrderTemplateOrder);
exports.default = router.routes();
//# sourceMappingURL=recurrentOrderTemplateOrder.routes.js.map