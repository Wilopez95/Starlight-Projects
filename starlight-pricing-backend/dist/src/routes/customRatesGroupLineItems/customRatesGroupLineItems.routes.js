"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require("koa-router");
const customRatesGroupLineItems_controller_1 = require("../../controllers/customRatesGroupLineItems/customRatesGroupLineItems.controller");
const validate_1 = require("./validate");
const authorized_1 = require("../../middlewares/authorized");
const validate_2 = require("../../middlewares/validate");
const controller = new customRatesGroupLineItems_controller_1.CustomRatesGroupLineItemsController();
const router = new Router();
router.get("/by", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.updateCustomRatesGroupLineItemsSchema), controller.getCustomerRatesGroupLineItemsBy);
router.get("/", (0, authorized_1.authorized)([]), controller.getCustomerRatesGroupLineItems);
router.post("/", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.createCustomRatesGroupLineItemsSchema), controller.addCustomerRatesGroupLineItems);
router.put("/", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.updateCustomRatesGroupLineItemsSchema), controller.updateCustomerRatesGroupLineItems);
// router.delete("/", authorized([]), controller.deleteLineItems);
exports.default = router.routes();
//# sourceMappingURL=customRatesGroupLineItems.routes.js.map