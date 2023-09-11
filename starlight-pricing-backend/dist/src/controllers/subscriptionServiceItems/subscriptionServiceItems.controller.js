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
exports.SubscriptionServiceItemsController = void 0;
const SubscriptionServiceItemHistorical_1 = require("../../database/entities/tenant/SubscriptionServiceItemHistorical");
const typeorm_1 = require("typeorm");
const SubscriptionServiceItem_1 = require("../../database/entities/tenant/SubscriptionServiceItem");
const base_controller_1 = require("../base.controller");
const haulingRequest_1 = require("./../../request/haulingRequest");
class SubscriptionServiceItemsController extends base_controller_1.BaseController {
    constructor() {
        super();
    }
    getSubscriptionServiceItems(ctx, next) {
        const _super = Object.create(null, {
            getAll: { get: () => super.getAll }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.getAll.call(this, ctx, next, SubscriptionServiceItem_1.SubscriptionServiceItem);
        });
    }
    getSubscriptionServiceItemBy(ctx, next) {
        const _super = Object.create(null, {
            getBy: { get: () => super.getBy }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.getBy.call(this, ctx, next, SubscriptionServiceItem_1.SubscriptionServiceItem);
        });
    }
    getSubscriptionServiceItemById(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            let id = ctx.request.body.id;
            let dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            const recurrentOrder = yield dataSource.manager
                .createQueryBuilder()
                .select("subsServiceItem")
                .from(SubscriptionServiceItem_1.SubscriptionServiceItem, "subsServiceItem")
                .leftJoinAndMapMany("subsServiceItem.lineItems", // Row to map the information
            "SubscriptionLineItem", // Entity or table
            "lineItems", // Alias
            "subsServiceItem.id = lineItems.subscriptionServiceItemId")
                .leftJoinAndMapMany("subsServiceItem.subscriptionOrders", // Row to map the information
            "SubscriptionOrders", // Entity or table
            "subsOrders", // Alias
            "subsServiceItem.id = subsOrders.subscriptionServiceItemId")
                .where(`subsServiceItem.subscriptionId = ${id}`)
                .andWhere({ billingCycle: (0, typeorm_1.Not)((0, typeorm_1.IsNull)()) })
                .getMany();
            yield dataSource.destroy();
            let response = [];
            if (recurrentOrder && recurrentOrder.length > 0) {
                for (let index = 0; index < recurrentOrder.length; index++) {
                    let ids = [];
                    let requestbody = {
                        billableServiceId: recurrentOrder[index].billableServiceId,
                    };
                    if (recurrentOrder[index].materialId) {
                        requestbody.materialId = recurrentOrder[index].materialId;
                    }
                    if (recurrentOrder[index].serviceFrequencyId) {
                        ids.push(recurrentOrder[index].serviceFrequencyId);
                        requestbody.frequencyIds = ids;
                    }
                    if (requestbody) {
                        try {
                            let requestResponse = yield (0, haulingRequest_1.getOrderData)(ctx, {
                                data: requestbody,
                            });
                            Object.assign(recurrentOrder[index], Object.assign({}, requestResponse));
                        }
                        catch (error) { }
                    }
                    response.push(recurrentOrder[index]);
                }
            }
            ctx.body = response;
            ctx.status = 200;
            return next();
        });
    }
    getDetailsForRoutePlanner(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            let id = ctx.request.body.id;
            let dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            const subscription = yield dataSource
                .createQueryBuilder()
                .select("subsServiceItem")
                .from(SubscriptionServiceItem_1.SubscriptionServiceItem, "subsServiceItem")
                .leftJoinAndMapOne("subsServiceItem.subscription", // Row to map the information
            "Subscriptions", // Entity or table
            "subs", // Alias
            "subsServiceItem.subscriptionId = subs.id")
                .where(`subsServiceItem.id = ${id}`)
                .getOne();
            yield dataSource.destroy();
            let response = {};
            response.businessUnitId = subscription.subscription.businessUnitId;
            response.businessLineId = subscription.subscription.businessLineId;
            response.jobSiteNote = subscription.subscription.jobSiteNote;
            response.subscriptionId = subscription.subscription.id;
            response.serviceItemId = subscription.id;
            let requestbody = {
                billableServiceId: subscription.billableServiceId,
                jobSiteContactId: subscription.subscription.jobSiteContactId,
                materialId: subscription.materialId,
                customerId_Histo: subscription.subscription.customerId,
                jobSiteId: subscription.subscription.jobSiteId,
                serviceAreaId: subscription.subscription.serviceAreaId,
            };
            let requestResponse = yield (0, haulingRequest_1.getOrderData)(ctx, { data: requestbody });
            let billableService = requestResponse.billableService;
            let jobSiteContact = requestResponse.jobSiteContact;
            let material = requestResponse.material;
            let customer = requestResponse.customer;
            let jobSite = requestResponse.jobSite;
            let serviceArea = requestResponse.serviceArea;
            let requestbodyEquipment = {
                equipmentItemId: billableService.equipmentItemId,
            };
            let requestResponseEquipment = yield (0, haulingRequest_1.getOrderData)(ctx, {
                data: requestbodyEquipment,
            });
            let equipmentItem = requestResponseEquipment.equipmentItem;
            response.customerId = customer === null || customer === void 0 ? void 0 : customer.originalId;
            response.jobSiteId = jobSite === null || jobSite === void 0 ? void 0 : jobSite.originalId;
            response.serviceAreaId = serviceArea === null || serviceArea === void 0 ? void 0 : serviceArea.originalId;
            response.materialId = material === null || material === void 0 ? void 0 : material.originalId;
            response.jobSiteContactId = jobSiteContact === null || jobSiteContact === void 0 ? void 0 : jobSiteContact.originalId;
            response.billableServiceId = billableService === null || billableService === void 0 ? void 0 : billableService.originalId;
            response.billableServiceDescription = billableService === null || billableService === void 0 ? void 0 : billableService.description;
            response.equipmentItemId = equipmentItem === null || equipmentItem === void 0 ? void 0 : equipmentItem.originalId;
            response.equipmentItemSize = equipmentItem === null || equipmentItem === void 0 ? void 0 : equipmentItem.size;
            ctx.body = response;
            ctx.status = 200;
            return next();
        });
    }
    addSubscriptionServiceItem(ctx, next) {
        const _super = Object.create(null, {
            insert: { get: () => super.insert }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.insert.call(this, ctx, next, SubscriptionServiceItem_1.SubscriptionServiceItem, SubscriptionServiceItemHistorical_1.SubscriptionServiceItemHistorical);
        });
    }
    bulkaddSubscriptionServiceItem(ctx, next) {
        const _super = Object.create(null, {
            bulkInserts: { get: () => super.bulkInserts }
        });
        return __awaiter(this, void 0, void 0, function* () {
            ctx.request.body = ctx.request.body.data;
            return _super.bulkInserts.call(this, ctx, next, SubscriptionServiceItem_1.SubscriptionServiceItem, SubscriptionServiceItemHistorical_1.SubscriptionServiceItemHistorical);
        });
    }
    updateSubscriptionServiceItem(ctx, next) {
        const _super = Object.create(null, {
            update: { get: () => super.update }
        });
        return __awaiter(this, void 0, void 0, function* () {
            let id = +ctx.url.split("/")[4];
            delete ctx.request.body.lineItems;
            return _super.update.call(this, ctx, next, SubscriptionServiceItem_1.SubscriptionServiceItem, SubscriptionServiceItemHistorical_1.SubscriptionServiceItemHistorical, id);
        });
    }
    deleteSubscriptionServiceItem(ctx, next) {
        const _super = Object.create(null, {
            delete: { get: () => super.delete }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.delete.call(this, ctx, next, SubscriptionServiceItem_1.SubscriptionServiceItem, SubscriptionServiceItemHistorical_1.SubscriptionServiceItemHistorical);
        });
    }
    getSubscriptionServiceItemIds(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const subscriptionId = ctx.request.body.subscriptionId;
            let dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            const data = yield dataSource
                .createQueryBuilder()
                .select(["subscriptionServiceItem.id"])
                .from(SubscriptionServiceItem_1.SubscriptionServiceItem, "subscriptionServiceItem")
                .where({ subscriptionId: subscriptionId })
                .getMany();
            yield dataSource.destroy();
            ctx.body = data[0];
            ctx.status = 200;
            return next();
        });
    }
    upsertSubscriptionServiceItems(ctx, next) {
        const _super = Object.create(null, {
            insert: { get: () => super.insert }
        });
        return __awaiter(this, void 0, void 0, function* () {
            ctx.request.body = ctx.request.body.data;
            let dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            yield dataSource.manager.update(SubscriptionServiceItem_1.SubscriptionServiceItem, { subscriptionId: ctx.request.body[0].subscriptionId }, { isDeleted: true });
            yield dataSource.destroy();
            return _super.insert.call(this, ctx, next, SubscriptionServiceItem_1.SubscriptionServiceItem);
        });
    }
    getItemBySpecificDate(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { serviceItemId, specifiedDate } = ctx.request.body.data;
            let dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            const subscription = yield dataSource
                .createQueryBuilder()
                .select("*")
                .addSelect("coalesce(subsServiceItem.effectiveDate, subsServiceItem.createdAt)::timestamp as effective_date")
                .from(SubscriptionServiceItemHistorical_1.SubscriptionServiceItemHistorical, "subsServiceItem")
                .where({ originalId: serviceItemId })
                .andWhere(`coalesce(subsServiceItem.effectiveDate, subsServiceItem.createdAt)::timestamp <= '${specifiedDate}'`)
                .orderBy("coalesce(subsServiceItem.effectiveDate, subsServiceItem.createdAt)::timestamp", "DESC")
                .getRawOne();
            yield dataSource.destroy();
            ctx.body = subscription;
            ctx.status = 200;
            return next();
        });
    }
    getNextItemBySpecificDate(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { serviceItemId, specifiedDate } = ctx.request.body.data;
            let dataSource = yield base_controller_1.BaseController.getDataSource(ctx.state.user.tenantName);
            const subscription = yield dataSource
                .createQueryBuilder()
                .select("*")
                .addSelect("coalesce(subsServiceItem.effectiveDate, subsServiceItem.createdAt)::timestamp as effective_date")
                .from(SubscriptionServiceItemHistorical_1.SubscriptionServiceItemHistorical, "subsServiceItem")
                .where({ originalId: serviceItemId })
                .andWhere(`coalesce(subsServiceItem.effectiveDate, subsServiceItem.createdAt)::timestamp > '${specifiedDate}'`)
                .orderBy("coalesce(subsServiceItem.effectiveDate, subsServiceItem.createdAt)::timestamp", "ASC")
                .getRawOne();
            yield dataSource.destroy();
            const result = subscription ? subscription : {};
            ctx.body = result;
            ctx.status = 200;
            return next();
        });
    }
}
exports.SubscriptionServiceItemsController = SubscriptionServiceItemsController;
//# sourceMappingURL=subscriptionServiceItems.controller.js.map