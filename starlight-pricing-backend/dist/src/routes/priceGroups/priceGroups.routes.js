"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require("koa-router");
const priceGroup_controller_1 = require("../../controllers/priceGroup/priceGroup.controller");
const validate_1 = require("./validate");
const authorized_1 = require("../../middlewares/authorized");
const validate_2 = require("../../middlewares/validate");
const controller = new priceGroup_controller_1.PriceGroupController();
const router = new Router();
router.get("/by", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.updatePriceGroupSchema), controller.getPriceGroupBy);
router.get("/", (0, authorized_1.authorized)([]), controller.getPriceGroup);
router.get("/byType", (0, authorized_1.authorized)([]), controller.getPriceGroupByType);
router.post("/", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.createPriceGroupSchema), controller.addPriceGroup);
router.put("/:id", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.updatePriceGroupSchema), controller.updatePriceGroup);
router.post("/:id/clone", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.createPriceGroupSchema), controller.duplicatePriceGroup);
//router.delete("/", authorized([]), controller.deletePriceGroup);
exports.default = router.routes();
//# sourceMappingURL=priceGroups.routes.js.map