"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require("koa-router");
const customRatesGroupLineItemsHistorical_controller_1 = require("../../controllers/customRatesGroupLineItemsHistorical/customRatesGroupLineItemsHistorical.controller");
const validate_1 = require("./validate");
const authorized_1 = require("../../middlewares/authorized");
const validate_2 = require("../../middlewares/validate");
const controller = new customRatesGroupLineItemsHistorical_controller_1.CustomRatesGroupLineItemsHistoricalController();
const router = new Router();
router.get("/by", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.updateCustomRatesGroupLineItemsHistoricalSchema), controller.getCustomerRatesGroupLineItemsHistoricalBy);
router.get("/", (0, authorized_1.authorized)([]), controller.getCustomerRatesGroupLineItemsHistorical);
router.post("/", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.createCustomRatesGroupLineItemsHistoricalSchema), controller.addCustomerRatesGroupLineItemsHistorical);
exports.default = router.routes();
//# sourceMappingURL=customRatesGroupLineItemsHistorical.routes.js.map