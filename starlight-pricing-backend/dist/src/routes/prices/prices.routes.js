"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require("koa-router");
const prices_controller_1 = require("../../controllers/prices/prices.controller");
const validate_1 = require("./validate");
const authorized_1 = require("../../middlewares/authorized");
const validate_2 = require("../../middlewares/validate");
const controller = new prices_controller_1.PriceController();
const router = new Router();
router.get("/by", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.updatePriceSchema), controller.getPriceBy);
router.get("/", (0, authorized_1.authorized)([]), controller.getPrice);
router.post("/", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.createPriceSchema), controller.addPrice);
router.put("/", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.updatePriceSchema), controller.updatePrice);
router.delete("/", (0, authorized_1.authorized)([]), controller.deletePrice);
exports.default = router.routes();
//# sourceMappingURL=prices.routes.js.map