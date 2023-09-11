"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require("koa-router");
const customRatesGroupRecurringServiceFrequencyHistorical_controller_1 = require("../../controllers/customRatesGroupRecurringServiceFrequencyHistorical/customRatesGroupRecurringServiceFrequencyHistorical.controller");
const validate_1 = require("./validate");
const authorized_1 = require("../../middlewares/authorized");
const validate_2 = require("../../middlewares/validate");
const controller = new customRatesGroupRecurringServiceFrequencyHistorical_controller_1.CustomRatesGroupRecurringServiceFrequencyHistoricalController();
const router = new Router();
router.get("/by", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.updateCustomRatesGroupServiceFrecuencyHistoricalSchema), controller.getCustomRatesGroupRecurringServiceFrequencyHistoricalBy);
router.get("/", (0, authorized_1.authorized)([]), controller.getCustomRatesGroupRecurringServiceFrequencyHistorical);
router.post("/", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.createCustomRatesGroupServiceFrequencyHistoricalSchema), controller.addCustomRatesGroupRecurringServiceFrequencyHistorical);
exports.default = router.routes();
//# sourceMappingURL=customRatesGroupRecurringServiceFrequencyHistorical.routes.js.map