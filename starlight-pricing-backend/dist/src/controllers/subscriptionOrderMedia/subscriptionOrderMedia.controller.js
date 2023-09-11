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
exports.SubscriptionOrderMediaController = void 0;
const SubscriptionOrdersMedia_1 = require("../../database/entities/tenant/SubscriptionOrdersMedia");
const base_controller_1 = require("../base.controller");
const SubscriptionOrdersMediaHistorical_1 = require("../../database/entities/tenant/SubscriptionOrdersMediaHistorical");
const SubscriptionWorkOrders_1 = require("../../database/entities/tenant/SubscriptionWorkOrders");
const httpStatusCodes_1 = require("../../consts/httpStatusCodes");
class SubscriptionOrderMediaController extends base_controller_1.BaseController {
    constructor() {
        super();
    }
    upsertSubscriptionOrderMedia(ctx, next) {
        const _super = Object.create(null, {
            insert: { get: () => super.insert }
        });
        return __awaiter(this, void 0, void 0, function* () {
            let dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            yield dataSource.manager.delete(SubscriptionOrdersMedia_1.SubscriptionOrderMedia, {
                orderId: ctx.request.body[0].subscriptionOrderId,
            });
            yield dataSource.destroy();
            return _super.insert.call(this, ctx, next, SubscriptionOrdersMedia_1.SubscriptionOrderMedia, SubscriptionOrdersMediaHistorical_1.SubscriptionOrderMediaHistorical);
        });
    }
    createOneFromUrl(ctx, next) {
        const _super = Object.create(null, {
            insert: { get: () => super.insert }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const { subscriptionWorkOrderId } = ctx.request.body;
            let dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            let getSubsciption = yield dataSource
                .createQueryBuilder()
                .select("subOrders.subscriptionId")
                .from(SubscriptionWorkOrders_1.SubscriptionWorkOrders, "subWorkOrders")
                .innerJoin("SubscriptionOrders", "subOrders", "subWorkOrders.subscriptionOrderId = subOrders.id")
                .where(`subWorkOrders.id= ${subscriptionWorkOrderId}`)
                .getRawOne();
            yield dataSource.destroy();
            if (!getSubsciption.subOrders_subscription_id) {
                ctx.state = httpStatusCodes_1.default.BAD_REQUEST;
                return next();
            }
            const body = ctx.request.body;
            const copyUrl = body.url; //this variable prevents mutability
            const fileUrlParts = copyUrl.split("/");
            const fileName = fileUrlParts.pop();
            body.subscriptionId = getSubsciption.subOrders_subscription_id;
            body.fileName = fileName;
            ctx.request.body = body;
            return yield _super.insert.call(this, ctx, next, SubscriptionOrdersMedia_1.SubscriptionOrderMedia, SubscriptionOrdersMediaHistorical_1.SubscriptionOrderMediaHistorical);
        });
    }
}
exports.SubscriptionOrderMediaController = SubscriptionOrderMediaController;
//# sourceMappingURL=subscriptionOrderMedia.controller.js.map