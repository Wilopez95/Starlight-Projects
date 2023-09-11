"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require("koa-router");
const validate_1 = require("./validate");
const authorized_1 = require("../../middlewares/authorized");
const validate_2 = require("../../middlewares/validate");
const orderTaxDistrictTaxes_controller_1 = require("../../controllers/orderTaxDistrictTaxes/orderTaxDistrictTaxes.controller");
const controller = new orderTaxDistrictTaxes_controller_1.OrderTaxDistrictTaxesController();
const router = new Router();
router.get("/by", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.updateOrderTaxDistrictTaxesSchema), controller.getOrderTaxDistrictTaxesBy);
router.get("/", (0, authorized_1.authorized)([]), controller.getOrderTaxDistrictTaxes);
router.post("/", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.createOrderTaxDistrictTaxesSchema), controller.addOrderTaxDistrictTaxes);
// router.put(
//   "/:id",
//   authorized([]),
//   validate(updatePriceGroupSchema),
//   controller.updatePriceGroup
// );
//router.delete("/", authorized([]), controller.deletePriceGroup);
exports.default = router.routes();
//# sourceMappingURL=orderTaxDistrictTaxes.routes.js.map