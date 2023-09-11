"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require("koa-router");
const recurrentOrderTemplateHistorical_controller_1 = require("../../controllers/recurrentOrderTemplateHistorical/recurrentOrderTemplateHistorical.controller");
const authorized_1 = require("../../middlewares/authorized");
const validate_1 = require("./validate");
const validate_2 = require("../../middlewares/validate");
const controller = new recurrentOrderTemplateHistorical_controller_1.RecurrentOrderTemplateHistoricalController();
const router = new Router();
router.get("/by", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.updateRecurrentOrderTemplateHistorical), controller.getRecurrentOrderTemplateHistoricalBy);
router.get("/", (0, authorized_1.authorized)([]), controller.getRecurrentOrderTemplateHistorical);
// router.post(
//   "/",
//   authorized([]),
//   validate(createRecurrentOrderTemplateHistorical),
//   controller.addRecurrentOrderTemplateHistorical
// );
// router.put(
//   "/",
//   authorized([]),
//   validate(updateRecurrentOrderTemplateHistorical),
//   controller.updateRecurrentOrderTemplateHistorical
// );
// router.delete(
//   "/",
//   authorized([]),
//   controller.deleteRecurrentOrderTemplateHistorical
// );
exports.default = router.routes();
//# sourceMappingURL=recurrentOrderTemplateHistorical.routes.js.map