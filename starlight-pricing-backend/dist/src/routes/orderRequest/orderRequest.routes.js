"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require("koa-router");
const orderRequest_controller_1 = require("../../controllers/orderRequests/orderRequest.controller");
const validate_1 = require("./validate");
const authorized_1 = require("../../middlewares/authorized");
const validate_2 = require("../../middlewares/validate");
const controller = new orderRequest_controller_1.OrderRequestController();
const router = new Router();
router.get("/by", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.updateOrderRequestSchema), controller.getOrderRequestsBy);
router.get("/", (0, authorized_1.authorized)([]), controller.getOrderRequests);
router.post("/", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.createOrderRequestSchema), controller.addOrderRequests);
router.put("/", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.updateOrderRequestSchema), controller.updateOrderRequests);
router.delete("/", (0, authorized_1.authorized)([]), controller.deleteOrderRequests);
exports.default = router.routes();
//# sourceMappingURL=orderRequest.routes.js.map