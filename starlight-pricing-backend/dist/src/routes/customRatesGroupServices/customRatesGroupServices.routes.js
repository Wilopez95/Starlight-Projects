"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require("koa-router");
const customRatesGroupServices_controller_1 = require("../../controllers/customRatesGroupServices/customRatesGroupServices.controller");
const validate_1 = require("./validate");
const authorized_1 = require("../../middlewares/authorized");
const validate_2 = require("../../middlewares/validate");
const controller = new customRatesGroupServices_controller_1.CustomRatesGroupServicesController();
const router = new Router();
router.get("/by", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.updateCustomRatesGroupServicesSchema), controller.getCustomRatesRGroupServicesBy);
router.get("/", (0, authorized_1.authorized)([]), controller.getCustomRatesGroupServices);
router.post("/", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.createCustomRatesGroupServicesSchema), controller.addCustomRatesGroupServices);
router.put("/", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.updateCustomRatesGroupServicesSchema), controller.updateCustomRatesGroupServices);
exports.default = router.routes();
//# sourceMappingURL=customRatesGroupServices.routes.js.map