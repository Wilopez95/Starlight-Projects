"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require("koa-router");
const lineItem_controller_1 = require("../../controllers/lineItem/lineItem.controller");
const validate_1 = require("./validate");
const authorized_1 = require("../../middlewares/authorized");
const validate_2 = require("../../middlewares/validate");
const controller = new lineItem_controller_1.LineItemsController();
const router = new Router();
router.get("/by", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.updateLineItemsSchema), controller.getLineItemsBy);
router.get("/", (0, authorized_1.authorized)([]), controller.getLineItems);
router.post("/", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.createLineItemsSchema), controller.addLineItems);
router.post("/upsert", (0, authorized_1.authorized)([]), controller.upsertLineItems);
router.post("/bulk", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.bulkCreateLineItemsSchema), controller.bulkAddLineItems);
router.put("/", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.updateLineItemsSchema), controller.updateLineItems);
router.delete("/", (0, authorized_1.authorized)([]), controller.deleteLineItems);
exports.default = router.routes();
//# sourceMappingURL=lineItems.routes.js.map