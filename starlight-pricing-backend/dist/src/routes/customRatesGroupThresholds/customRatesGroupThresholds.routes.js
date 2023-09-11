"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require("koa-router");
const customRatesGroupThresholds_controller_1 = require("../../controllers/customRatesGroupThresholds/customRatesGroupThresholds.controller");
const validate_1 = require("./validate");
const authorized_1 = require("../../middlewares/authorized");
const validate_2 = require("../../middlewares/validate");
const controller = new customRatesGroupThresholds_controller_1.CustomRatesGroupThresholdsController();
const router = new Router();
router.post("/", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.createCustomRatesGroupThresholdsSchema), controller.addCustomRatesGroupThresholds);
router.put("/", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.updateCustomRatesGroupThresholdsSchema), controller.updateCustomRatesGroupThresholds);
exports.default = router.routes();
//# sourceMappingURL=customRatesGroupThresholds.routes.js.map