"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require("koa-router");
const recurrentOrderTemplateLineItemsHistorical_controller_1 = require("../../controllers/recurrentOrderTemplateLineItemsHistorical/recurrentOrderTemplateLineItemsHistorical.controller");
const authorized_1 = require("../../middlewares/authorized");
const validate_1 = require("./validate");
const validate_2 = require("../../middlewares/validate");
const controller = new recurrentOrderTemplateLineItemsHistorical_controller_1.RecurrentOrderTemplateLineItemsHistoricalController();
const router = new Router();
router.get("/by", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.updateRecurrentOrderTemplateLineItemsHistorical), controller.getRecurrentOrderTemplateLineItemsHistoricalBy);
router.get("/", (0, authorized_1.authorized)([]), controller.getRecurrentOrderTemplateLineItemsHistorical);
// router.post(
//   "/",
//   authorized([]),
//   validate(createRecurrentOrderTemplateLineItemsHistorical),
//   controller.addRecurrentOrderTemplateLineItemsHistorical
// );
// router.put(
//   "/",
//   authorized([]),
//   validate(updateRecurrentOrderTemplateLineItemsHistorical),
//   controller.updateRecurrentOrderTemplateLineItemsHistorical
// );
// router.delete(
//   "/",
//   authorized([]),
//   controller.deleteRecurrentOrderTemplateLineItemsHistorical
// );
exports.default = router.routes();
//# sourceMappingURL=recurrentOrderTemplateLineItemsHistorical.routes.js.map