"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionWorkOrdersLineItemsController = void 0;
const SubscriptionWorkOrdersLineItems_1 = require("../../database/entities/tenant/SubscriptionWorkOrdersLineItems");
const base_controller_1 = require("../base.controller");
const SubscriptionWorkOrdersLineItemsHistorical_1 = require("../../database/entities/tenant/SubscriptionWorkOrdersLineItemsHistorical");
class SubscriptionWorkOrdersLineItemsController extends base_controller_1.BaseController {
    constructor() {
        super();
    }
    upsertSubscriptionOrderMedia(ctx, next) {
        const _super = Object.create(null, {
            insert: { get: () => super.insert }
        });
        return __awaiter(this, void 0, void 0, function* () {
            let dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            yield dataSource.manager.delete(SubscriptionWorkOrdersLineItems_1.SubscriptionWorkOrdersLineItems, {
                orderId: ctx.request.body[0].subscriptionOrderId,
            });
            yield dataSource.destroy();
            return _super.insert.call(this, ctx, next, SubscriptionWorkOrdersLineItems_1.SubscriptionWorkOrdersLineItems, SubscriptionWorkOrdersLineItemsHistorical_1.SubscriptionWorkOrdersLineItemsHistorical);
        });
    }
}
exports.SubscriptionWorkOrdersLineItemsController = SubscriptionWorkOrdersLineItemsController;
//# sourceMappingURL=subscriptionWorkOrdersLineItems.controller.js.map