"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require("koa-router");
const customRatesGroups_controller_1 = require("../../controllers/customRatesGroups/customRatesGroups.controller");
const validate_1 = require("./validate");
const authorized_1 = require("../../middlewares/authorized");
const validate_2 = require("../../middlewares/validate");
const controller = new customRatesGroups_controller_1.CustomRatesGroupsController();
const router = new Router();
router.get("/custom", (0, authorized_1.authorized)([]), controller.getCustomRatesGroups);
router.get("/custom/:id", (0, authorized_1.authorized)([]), controller.getCustomRatesGroupBy);
router.post("/custom", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.createCustomRatesGroupsSchema), controller.addCustomRatesGroups);
router.put("/:id", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.updateCustomRatesGroupsSchema), controller.updateCustomRatesGroups);
router.post("/:id/duplicate", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.createCustomRatesGroupsSchema), controller.duplicateCustomRatesGroups);
exports.default = router.routes();
//# sourceMappingURL=customRatesGroups.routes.js.map