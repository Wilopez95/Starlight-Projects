"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require("koa-router");
const customRatesGroupSurcharges_controller_1 = require("../../controllers/customRatesGroupSurcharges/customRatesGroupSurcharges.controller");
const validate_1 = require("./validate");
const authorized_1 = require("../../middlewares/authorized");
const validate_2 = require("../../middlewares/validate");
const controller = new customRatesGroupSurcharges_controller_1.CustomRatesGroupSurchargesController();
const router = new Router();
router.post("/", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.createCustomRatesGroupSurchagesSchema), controller.addCustomRatesGroupSurcharges);
router.put("/", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.updateCustomRatesGroupSurchargesSchema), controller.updateCustomRatesGroupSurcharges);
exports.default = router.routes();
//# sourceMappingURL=customRatesGroupSurcharges.routes.js.map