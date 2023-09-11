"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require("koa-router");
const subscriptions_controller_1 = require("../../controllers/subscriptions/subscriptions.controller");
const subscriptionOrders_routes_1 = require("../../routes/subscriptionOrders/subscriptionOrders.routes");
const authorized_1 = require("../../middlewares/authorized");
const validate_1 = require("./validate");
const validate_2 = require("../../middlewares/validate");
const requestParamsParser_1 = require("../../middlewares/requestParamsParser");
const controller = new subscriptions_controller_1.SubscriptionsController();
const router = new Router();
router.use("/orders", subscriptionOrders_routes_1.default);
router.get("/by", (0, authorized_1.authorized)([]), 
//   validate(updateSubscriptionOrder),
controller.getSubscriptionsBy);
router.get("/", (0, authorized_1.authorized)([]), controller.getSubscriptionsList);
router.get("/toinvoice", (0, authorized_1.authorized)([]), controller.getSubscriptionsListToInvoice);
router.get("/count", (0, authorized_1.authorized)([]), controller.getSubscriptionsCount);
router.get("/ending", (0, authorized_1.authorized)([]), controller.getEndingSubscriptions);
router.post("/ending/close", (0, authorized_1.authorized)([]), controller.closeEndingSubscriptions);
router.post("/", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.createSubscriptionData), controller.addSubscriptions);
router.post("/draft", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.createSubscriptionDraftData), controller.addSubscriptions);
router.put("/:id", (0, authorized_1.authorized)([]), 
//   validate(updateSubscriptionOrder),
controller.updateSubscriptions);
//router.get("/list", authorized([]), controller.getSubscriptionsList);
router.get("/service-items", (0, authorized_1.authorized)([]), controller.getSubscriptionsServiceItems);
router.get("/subscription-paginated", (0, authorized_1.authorized)([]), (0, validate_2.validate)(validate_1.queryParams, "query"), (0, validate_2.validate)(validate_1.mineOnly, "query"), controller.getSubscriptionsPaginated);
router.get("/search", (0, authorized_1.authorized)([]), requestParamsParser_1.processSearchQuery.bind(null, "query", true), (0, validate_2.validate)(validate_1.simpleSearchParams, "query"), controller.getSearch);
router.get("/:id", (0, authorized_1.authorized)([]), controller.getSubscription);
router.get("/draft/:id", (0, authorized_1.authorized)([]), controller.getSubscription);
router.delete("/", (0, authorized_1.authorized)([]), controller.deleteSubscriptions);
router.get("/:id/details", (0, authorized_1.authorized)([]), controller.getSubscription);
router.get("/stream/tenant", (0, authorized_1.authorized)([]), controller.streamTenant);
exports.default = router.routes();
//# sourceMappingURL=subscriptions.routes.js.map