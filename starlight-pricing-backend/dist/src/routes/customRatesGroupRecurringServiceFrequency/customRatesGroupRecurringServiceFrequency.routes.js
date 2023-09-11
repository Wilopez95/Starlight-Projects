"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require("koa-router");
const customRatesGroupRecurringServiceFrequency_controller_1 = require("../../controllers/customRatesGroupRecurringServiceFrequency/customRatesGroupRecurringServiceFrequency.controller");
const validate_1 = require("./validate");
const authorized_1 = require("../../middlewares/authorized");
const validate_2 = require("../../middlewares/validate");
const controller = new customRatesGroupRecurringServiceFrequency_controller_1.CustomRatesGroupRecurringServiceFrequencyController();
const router = new Router();
router.get("/by", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.updateCustomRatesGroupServiceFrecuencySchema), controller.getCustomRatesGroupRecurringServiceFrequencyBy);
router.get("/", (0, authorized_1.authorized)([]), controller.getCustomRatesGroupRecurringServiceFrequency);
router.post("/", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.createCustomRatesGroupServiceFrequencySchema), controller.addCustomRatesGroupRecurringServiceFrequency);
router.put("/", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.updateCustomRatesGroupServiceFrecuencySchema), controller.updateCustomRatesGroupRecurringServiceFrequency);
exports.default = router.routes();
//# sourceMappingURL=customRatesGroupRecurringServiceFrequency.routes.js.map