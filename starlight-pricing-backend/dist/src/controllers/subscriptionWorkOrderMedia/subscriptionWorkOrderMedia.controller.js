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
exports.SubscriptionWorkOrderMediaController = void 0;
const SubscriptionWorkOrdersMedia_1 = require("../../database/entities/tenant/SubscriptionWorkOrdersMedia");
const base_controller_1 = require("../base.controller");
const SubscriptionWorkOrdersMediaHistorical_1 = require("../../database/entities/tenant/SubscriptionWorkOrdersMediaHistorical");
class SubscriptionWorkOrderMediaController extends base_controller_1.BaseController {
    constructor() {
        super();
    }
    upsertSubscriptionOrderMedia(ctx, next) {
        const _super = Object.create(null, {
            insert: { get: () => super.insert }
        });
        return __awaiter(this, void 0, void 0, function* () {
            let dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            yield dataSource.manager.delete(SubscriptionWorkOrdersMedia_1.SubscriptionWorkOrdersMedia, {
                orderId: ctx.request.body[0].subscriptionOrderId,
            });
            yield dataSource.destroy();
            return _super.insert.call(this, ctx, next, SubscriptionWorkOrdersMedia_1.SubscriptionWorkOrdersMedia, SubscriptionWorkOrdersMediaHistorical_1.SubscriptionWorkOrdersMediaHistorical);
        });
    }
    createOneFromUrl(ctx, next) {
        const _super = Object.create(null, {
            insert: { get: () => super.insert }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const copyUrl = ctx.request.body.url; //this variable prevents mutability
            const fileUrlParts = copyUrl.split('/');
            const fileName = fileUrlParts.pop();
            ctx.request.body.fileName = fileName;
            return yield _super.insert.call(this, ctx, next, SubscriptionWorkOrdersMedia_1.SubscriptionWorkOrdersMedia, SubscriptionWorkOrdersMediaHistorical_1.SubscriptionWorkOrdersMediaHistorical);
        });
    }
    getData(ctx, next) {
        const _super = Object.create(null, {
            getBy: { get: () => super.getBy }
        });
        return __awaiter(this, void 0, void 0, function* () {
            let id = +ctx.request.url.split("/")[4];
            ctx.request.body.subscriptionWorkOrderId = id;
            return yield _super.getBy.call(this, ctx, next, SubscriptionWorkOrdersMedia_1.SubscriptionWorkOrdersMedia);
        });
    }
}
exports.SubscriptionWorkOrderMediaController = SubscriptionWorkOrderMediaController;
//# sourceMappingURL=subscriptionWorkOrderMedia.controller.js.map