"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require("koa-router");
const priceGroupHistory_controller_1 = require("../../controllers/priceGroupHistory/priceGroupHistory.controller");
const validate_1 = require("./validate");
const authorized_1 = require("../../middlewares/authorized");
const validate_2 = require("../../middlewares/validate");
const controller = new priceGroupHistory_controller_1.PriceGroupHistoricalController();
const router = new Router();
router.get("/by", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.selectPriceGroupHistoricalSchema), controller.getPriceGroupHistoricalBy);
router.get("/", (0, authorized_1.authorized)([]), controller.getPriceGroupHistorical);
exports.default = router.routes();
//# sourceMappingURL=priceGroupsHistorical.routes.js.map