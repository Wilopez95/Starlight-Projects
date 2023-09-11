"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require("koa-router");
const validate_1 = require("./validate");
const authorized_1 = require("../../middlewares/authorized");
const validate_2 = require("../../middlewares/validate");
const orders_controller_1 = require("../../controllers/orders/orders.controller");
const controller = new orders_controller_1.OrdersController();
const router = new Router();
router.get("/by", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.updateOrderSchema), controller.getOrdersBy);
router.get("/", (0, authorized_1.authorized)([]), controller.getOrders);
router.get("/history", (0, authorized_1.authorized)([]), controller.getOrderHistorical);
router.get("/reduced", (0, authorized_1.authorized)([]), controller.getOrdersSelect);
router.get("/byOrderTemplate", (0, authorized_1.authorized)([]), controller.getOrdersByOrderTemplate);
router.post("/", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.createOrderSchema), controller.addOrders);
router.post("/:id/approve", (0, authorized_1.authorized)([]), 
//validate(createOrderSchema),
controller.approveOrder);
router.post("/:id/unfinalize", (0, authorized_1.authorized)([]), 
//validate(createOrderSchema),
controller.unfinalizedOrder);
router.post("/:id/unapprove", (0, authorized_1.authorized)([]), 
//validate(createOrderSchema),
controller.unapproveOrder);
router.post("/:id/finalize", (0, authorized_1.authorized)([]), 
//validate(createOrderSchema),
controller.finalizedOrder);
router.post("/approve", (0, authorized_1.authorized)([]), 
//validate(createOrderSchema),
controller.bulkApproveOrder);
router.post("/finalize", (0, authorized_1.authorized)([]), 
//validate(createOrderSchema),
controller.bulkFinalizedOrder);
router.get("/count", (0, authorized_1.authorized)([]), controller.getCount);
router.put("/:id", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.updateOrderSchema), controller.updateOrders);
router.put("/:id/cascade", (0, authorized_1.authorized)([]), controller.updateOrdersCascade);
router.delete("/", (0, authorized_1.authorized)([]), controller.deleteOrders);
router.delete("/:id/cascade", (0, authorized_1.authorized)([]), controller.deleteCascadeOrders);
router.get("/invoiced", (0, authorized_1.authorized)([]), controller.invoicedOrders);
router.put("/update/state", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.updateByIdsSchema), controller.updateByIdOrderState);
exports.default = router.routes();
//# sourceMappingURL=orders.routes.js.map