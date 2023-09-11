"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require("koa-router");
const recurrentOrderTemplate_controller_1 = require("../../controllers/recurrentOrderTemplate/recurrentOrderTemplate.controller");
const authorized_1 = require("../../middlewares/authorized");
const validate_1 = require("./validate");
const validate_2 = require("../../middlewares/validate");
const controller = new recurrentOrderTemplate_controller_1.RecurrentOrderTemplateController();
const router = new Router();
router.get("/by", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.updateRecurrentOrderTemplate), controller.getRecurrentOrderTemplateBy);
router.get("/", (0, authorized_1.authorized)([]), controller.getRecurrentOrder);
router.get("/getDataForGeneration", (0, authorized_1.authorized)([]), controller.getDataForGeneration);
router.get("/count", (0, authorized_1.authorized)([]), controller.getCount);
router.post("/", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.recurrentOrderTemplate), controller.addRecurrentOrderTemplate);
router.get("/:id/details", 
//authorized([]),
// validate(recurrentOrderTemplate),
controller.getRecurrentOrderDetails);
router.get("/:id/orders", (0, authorized_1.authorized)([]), 
// validate(recurrentOrderTemplate),
controller.getRecurrentOrderTemplateGeneratedOrders);
router.post("/:id/put-on-hold", (0, authorized_1.authorized)([]), 
// validate(recurrentOrderTemplate),
controller.putRecurrentTemplateOnHold);
router.post("/:id/put-off-hold", (0, authorized_1.authorized)([]), 
// validate(recurrentOrderTemplate),
controller.putRecurrentTemplateOffHold);
router.post("/:id/close", (0, authorized_1.authorized)([]), 
// validate(recurrentOrderTemplate),
controller.closeRecurrentOrderTemplate);
// router.put(
//   "/:id",
//   authorized([]),
//   validate(updateRecurrentOrderTemplate),
//   controller.editRecurrentOrderTemplate
// );
router.put("/:id", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.updateRecurrentOrderTemplate), controller.updateRecurrentOrderTemplate);
router.delete("/", (0, authorized_1.authorized)([]), controller.deleteRecurrentOrderTemplate);
exports.default = router.routes();
//# sourceMappingURL=recurrentOrderTemplate.routes.js.map