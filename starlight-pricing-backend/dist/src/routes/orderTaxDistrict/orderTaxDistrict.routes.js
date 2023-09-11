"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require("koa-router");
const validate_1 = require("./validate");
const authorized_1 = require("../../middlewares/authorized");
const validate_2 = require("../../middlewares/validate");
const orderTaxDistrict_controller_1 = require("../../controllers/orderTaxDistrict/orderTaxDistrict.controller");
const controller = new orderTaxDistrict_controller_1.OrderTaxDistrictController();
const router = new Router();
router.get("/by", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.updateOrderTaxDistrictSchema), controller.getOrderTaxDistrictBy);
router.get("/", (0, authorized_1.authorized)([]), controller.getOrderTaxDistrict);
router.post("/", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.createOrderTaxDistrictSchema), controller.addOrderTaxDistrict);
router.post("/bulk", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.bulkCreateOrderTaxDistrictSchema), controller.bulkAddOrderTaxDistrict);
// router.put(
//   "/:id",
//   authorized([]),
//   validate(updatePriceGroupSchema),
//   controller.updatePriceGroup
// );
//router.delete("/", authorized([]), controller.deletePriceGroup);
exports.default = router.routes();
//# sourceMappingURL=orderTaxDistrict.routes.js.map