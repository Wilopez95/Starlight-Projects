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
exports.updateSubscriptionOrderStatus = void 0;
const date_fns_1 = require("date-fns");
const SubscriptionOrders_1 = require("./../../database/entities/tenant/SubscriptionOrders");
const data_source_1 = require("../../data-source");
const typeorm_1 = require("typeorm");
const base_controller_1 = require("../../controllers/base.controller");
const Tenants_1 = require("../../database/entities/admin/Tenants");
const haulingRequest_1 = require("../../request/haulingRequest");
const updateSubscriptionOrderStatus = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const tenantList = yield data_source_1.AppDataSource.manager.find(Tenants_1.Tenants);
    if (tenantList) {
        for (let index = 0; index < tenantList.length; index++) {
            let dataSource = yield base_controller_1.BaseController.getDataSource(tenantList[index].name);
            const queryRunner = dataSource.createQueryRunner();
            yield queryRunner.connect();
            try {
                let subscriptionOrders = yield queryRunner.manager
                    .createQueryBuilder()
                    .select("orders")
                    .from(SubscriptionOrders_1.SubscriptionOrders, "orders")
                    .innerJoinAndMapOne("orders.subscription", "Subscriptions", "subscription", `subscription.id = orders.subscriptionId`)
                    .where({ status: "SCHEDULED" })
                    .andWhere({ serviceDate: (0, typeorm_1.LessThan)((0, date_fns_1.endOfDay)(new Date())) })
                    .getMany();
                let requestBody = [];
                for (let indexSO = 0; indexSO < subscriptionOrders.length; indexSO++) {
                    let element = { ids: [], businessUnitId: subscriptionOrders[indexSO].subscription.businessUnitId, status: 'IN_PROGRESS', validOnly: false };
                    let inserted = false;
                    for (let validationIndex = 0; validationIndex < requestBody.length; validationIndex++) {
                        if (requestBody[validationIndex].businessUnitId === element.businessUnitId) {
                            requestBody[validationIndex].ids.push(subscriptionOrders[indexSO].id);
                            inserted = true;
                            break;
                        }
                    }
                    if (!inserted) {
                        element.ids.push(subscriptionOrders[indexSO].id);
                        requestBody.push(element);
                    }
                }
                for (let requestIndex = 0; requestIndex < requestBody.length; requestIndex++) {
                    let ctx = {};
                    ctx.state = {};
                    ctx.state.user = { schemaName: tenantList[index].name };
                    yield (0, haulingRequest_1.batchUpdateSubscriptionOrder)(ctx, { data: requestBody[requestIndex] });
                }
            }
            catch (e) {
                console.log("🚀 ~ file: subscriptionOrders.ts ~ line 58 ~ updateSubscriptionOrderStatus ~ e", e);
            }
            finally {
            }
            yield dataSource.destroy();
        }
        //
        //let datas: any = await dataSource.manager
        //  .createQueryBuilder()
        //  .select("subscription")
        //  .from(Subscriptions, "subscription")
        //  .where(whereFilter)
        //  .getOne();
    }
    else {
        console.error(`Any Tenant found`);
    }
});
exports.updateSubscriptionOrderStatus = updateSubscriptionOrderStatus;
//# sourceMappingURL=subscriptionOrders.js.map