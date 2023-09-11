"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PriceGroups_1 = require("../database/entities/tenant/PriceGroups");
const koa_graphql_1 = require("koa-graphql");
const graphql_1 = require("graphql");
const type_1 = require("./priceGroup/type");
const data_source_1 = require("../data-source");
const type_2 = require("./prices/type");
const Prices_1 = require("../database/entities/tenant/Prices");
const type_3 = require("./orderRequest/type");
const OrderRequests_1 = require("../database/entities/tenant/OrderRequests");
const type_4 = require("./priceGroupHistorical/type");
const PriceGroupsHistorical_1 = require("../database/entities/tenant/PriceGroupsHistorical");
const type_5 = require("./subscriptionsPeriods/type");
const SubscriptionsPeriods_1 = require("../database/entities/tenant/SubscriptionsPeriods");
const type_6 = require("./recurrentOrderTemplate/type");
const RecurrentOrderTemplates_1 = require("../database/entities/tenant/RecurrentOrderTemplates");
const types_1 = require("./orders/types");
const Orders_1 = require("../database/entities/tenant/Orders");
const RecurrentOrderTemplatesHistorical_1 = require("../database/entities/tenant/RecurrentOrderTemplatesHistorical");
const type_7 = require("./recurrentOrderTemplateHistorical/type");
const type_8 = require("./recurrentOrderTemplateLineItems/type");
const RecurrentOrderTemplateLineItems_1 = require("../database/entities/tenant/RecurrentOrderTemplateLineItems");
const RecurrentOrderTemplateLineItemsHistorical_1 = require("../database/entities/tenant/RecurrentOrderTemplateLineItemsHistorical");
const type_9 = require("./recurrentOrderTemplateLineItemsHistorical/type");
const types_2 = require("./thresholdItems/types");
const ThresholdItems_1 = require("../database/entities/tenant/ThresholdItems");
const types_3 = require("./surchargeItem/types");
const SurchargeItem_1 = require("../database/entities/tenant/SurchargeItem");
const types_4 = require("./lineItems/types");
const LineItems_1 = require("../database/entities/tenant/LineItems");
const type_10 = require("./subscriptionRecurringLineItemsSchedule/type");
const SubscriptionRecurringLineItemsSchedule_1 = require("../database/entities/tenant/SubscriptionRecurringLineItemsSchedule");
const type_11 = require("./subscriptionServiceItemsSchedule/type");
const SubscriptionServiceItemsSchedule_1 = require("../database/entities/tenant/SubscriptionServiceItemsSchedule");
const SubscriptionOrders_1 = require("../database/entities/tenant/SubscriptionOrders");
const type_12 = require("./subscriptionOrder/type");
const SubscriptionOrdersLineItems_1 = require("../database/entities/tenant/SubscriptionOrdersLineItems");
const type_13 = require("./subscriptionOrdersLineItems/type");
const types_5 = require("./customRatesGroupsHistorical/types");
const CustomRatesGroups_1 = require("../database/entities/tenant/CustomRatesGroups");
const CustomRatesGroupsHistorical_1 = require("../database/entities/tenant/CustomRatesGroupsHistorical");
const types_6 = require("./customRatesGroups/types");
const CustomRatesGroupServices_1 = require("../database/entities/tenant/CustomRatesGroupServices");
const types_7 = require("./customRatesGroupServices/types");
const resolver_1 = require("./customRatesGroups/resolver");
let RootQueryType = new graphql_1.GraphQLObjectType({
    name: "Query",
    description: "Root Query",
    fields: () => ({
        priceGroups: {
            type: new graphql_1.GraphQLList(type_1.default),
            description: "List of price groups",
            resolve: () => data_source_1.AppDataSource.manager.find(PriceGroups_1.PriceGroups),
        },
        prices: {
            type: new graphql_1.GraphQLList(type_2.default),
            description: "List of price groups",
            resolve: () => data_source_1.AppDataSource.manager.find(Prices_1.Prices),
        },
        orderRequest: {
            type: new graphql_1.GraphQLList(type_3.default),
            description: "list of order request",
            resolve: () => data_source_1.AppDataSource.manager.find(OrderRequests_1.OrderRequests),
        },
        priceGroupsHistorical: {
            type: new graphql_1.GraphQLList(type_4.default),
            description: "List of price groups historical",
            resolve: () => data_source_1.AppDataSource.manager.find(PriceGroupsHistorical_1.PriceGroupsHistorical),
        },
        subscriptionsPeriods: {
            type: new graphql_1.GraphQLList(type_5.default),
            description: "List of price groups historical",
            resolve: () => data_source_1.AppDataSource.manager.find(SubscriptionsPeriods_1.SubscriptionsPeriods),
        },
        recurrentOrderTemplate: {
            type: new graphql_1.GraphQLList(type_6.default),
            description: "List of recurrent order template",
            resolve: () => data_source_1.AppDataSource.manager.find(RecurrentOrderTemplates_1.RecurrentOrderTemplate),
        },
        orders: {
            type: new graphql_1.GraphQLList(types_1.default),
            description: "list of orders",
            resolve: () => data_source_1.AppDataSource.manager.find(Orders_1.Orders),
        },
        recurrentOrderTemplateHistorical: {
            type: new graphql_1.GraphQLList(type_7.default),
            description: "List of recurrent order template historical",
            resolve: () => data_source_1.AppDataSource.manager.find(RecurrentOrderTemplatesHistorical_1.RecurrentOrderTemplateHistorical),
        },
        recurrentOrderTemplateLineItems: {
            type: new graphql_1.GraphQLList(type_8.default),
            description: "List of recurrent order template line items",
            resolve: () => data_source_1.AppDataSource.manager.find(RecurrentOrderTemplateLineItems_1.RecurrentOrderTemplateLineItems),
        },
        recurrentOrderTemplateLineItemsHistorical: {
            type: new graphql_1.GraphQLList(type_9.default),
            description: "List of recurrent order template line items",
            resolve: () => data_source_1.AppDataSource.manager.find(RecurrentOrderTemplateLineItemsHistorical_1.RecurrentOrderTemplateLineItemsHistorical),
        },
        thresholdItems: {
            type: new graphql_1.GraphQLList(types_2.default),
            description: "list of thresholdItems",
            resolve: () => data_source_1.AppDataSource.manager.find(ThresholdItems_1.ThresholdItems),
        },
        surchargeItem: {
            type: new graphql_1.GraphQLList(types_3.default),
            description: "list of surchargeItem",
            resolve: () => data_source_1.AppDataSource.manager.find(SurchargeItem_1.SurchargeItem),
        },
        lineItems: {
            type: new graphql_1.GraphQLList(types_4.default),
            description: "list of lineItems",
            resolve: () => data_source_1.AppDataSource.manager.find(LineItems_1.LineItems),
        },
        subscriptionsRecurringLineItemsSchedule: {
            type: new graphql_1.GraphQLList(type_10.default),
            description: "list of subscription recurring line items schedule",
            resolve: () => data_source_1.AppDataSource.manager.find(SubscriptionRecurringLineItemsSchedule_1.SubscriptionRecurringLineItemsSchedule),
        },
        subscriptionsServiceItemsSchedule: {
            type: new graphql_1.GraphQLList(type_11.default),
            description: "list of subscription service items schedule",
            resolve: () => data_source_1.AppDataSource.manager.find(SubscriptionServiceItemsSchedule_1.SubscriptionServiceItemsSchedule),
        },
        subscriptionOrder: {
            type: new graphql_1.GraphQLList(type_12.default),
            description: "list of subscription orders ",
            resolve: () => data_source_1.AppDataSource.manager.find(SubscriptionOrders_1.SubscriptionOrders),
        },
        subscriptionOrdersLineItems: {
            type: new graphql_1.GraphQLList(type_13.default),
            description: "list of subscription orders line items ",
            resolve: () => data_source_1.AppDataSource.manager.find(SubscriptionOrdersLineItems_1.SubscriptionOrdersLineItems),
        },
        priceGroupsBy: {
            type: new graphql_1.GraphQLList(type_1.default),
            args: {
                id: { type: graphql_1.GraphQLInt },
                businessUnitId: { type: graphql_1.GraphQLInt },
                businessLineId: { type: graphql_1.GraphQLInt },
                serviceAreaIds: { type: new graphql_1.GraphQLList(graphql_1.GraphQLInt) },
                customerGroupId: { type: graphql_1.GraphQLInt },
                customerId: { type: graphql_1.GraphQLInt },
                customerJobSiteId: { type: graphql_1.GraphQLInt },
                active: { type: graphql_1.GraphQLBoolean },
            },
            description: "List of price groups",
            resolve: (parent, args) => {
                let where = {};
                if (args.id) {
                    where.id = args.id;
                }
                if (args.businessLineId) {
                    where.businessLineId = args.businessLineId;
                }
                if (args.businessUnitId) {
                    where.businessUnitId = args.businessUnitId;
                }
                if (args.serviceAreaIds) {
                    where.serviceAreaIds = args.serviceAreaIds;
                }
                if (args.customerGroupId) {
                    where.customerGroupId = args.customerGroupId;
                }
                if (args.customerId) {
                    where.customerId = args.customerId;
                }
                if (args.customerJobSiteId) {
                    where.customerJobSiteId = args.customerJobSiteId;
                }
                if (args.active) {
                    where.active = args.active;
                }
                return data_source_1.AppDataSource.manager.findBy(PriceGroups_1.PriceGroups, where);
            },
        },
        priceGroupsHistoricalBy: {
            type: new graphql_1.GraphQLList(type_4.default),
            args: {
                id: { type: graphql_1.GraphQLInt },
                businessUnitId: { type: graphql_1.GraphQLInt },
                businessLineId: { type: graphql_1.GraphQLInt },
                serviceAreaIds: { type: new graphql_1.GraphQLList(graphql_1.GraphQLInt) },
                customerGroupId: { type: graphql_1.GraphQLInt },
                customerId: { type: graphql_1.GraphQLInt },
                customerJobSiteId: { type: graphql_1.GraphQLInt },
                active: { type: graphql_1.GraphQLBoolean },
            },
            description: "A single price group",
            resolve: (parent, args) => {
                let where = {};
                if (args.id) {
                    where.id = args.id;
                }
                if (args.businessLineId) {
                    where.businessLineId = args.businessLineId;
                }
                if (args.businessUnitId) {
                    where.businessUnitId = args.businessUnitId;
                }
                if (args.serviceAreaIds) {
                    where.serviceAreaIds = args.serviceAreaIds;
                }
                if (args.customerGroupId) {
                    where.customerGroupId = args.customerGroupId;
                }
                if (args.customerId) {
                    where.customerId = args.customerId;
                }
                if (args.customerJobSiteId) {
                    where.customerJobSiteId = args.customerJobSiteId;
                }
                if (args.active) {
                    where.active = args.active;
                }
                return data_source_1.AppDataSource.manager.findBy(PriceGroups_1.PriceGroups, where);
            },
        },
        lineItemsBy: {
            type: new graphql_1.GraphQLList(types_4.default),
            description: "list of lineItems",
            args: {
                id: { type: graphql_1.GraphQLInt },
                order_id: { type: graphql_1.GraphQLInt },
                price: { type: graphql_1.GraphQLInt },
            },
            resolve: (args) => {
                let where = {};
                if (args.id) {
                    where.id = args.id;
                }
                if (args.order_id) {
                    where.order_id = args.order_id;
                }
                if (args.price_id) {
                    where.price_id;
                }
                data_source_1.AppDataSource.manager.findBy(LineItems_1.LineItems, where);
            },
        },
        orderRequestsBy: {
            type: new graphql_1.GraphQLList(type_3.default),
            description: "list of order request",
            args: {
                id: { type: graphql_1.GraphQLInt },
                customer_id: { type: graphql_1.GraphQLInt },
                status: { type: graphql_1.GraphQLString },
                job_site_id: { type: graphql_1.GraphQLInt },
            },
            resolve: (args) => {
                let where = {};
                if (args.id) {
                    where.id = args.id;
                }
                if (args.customer_id) {
                    where.customer_id = args.customer_id;
                }
                if (args.status) {
                    where.status = args.status;
                }
                if (args.job_site_id) {
                    where.job_site_id = args.job_site_id;
                }
                return data_source_1.AppDataSource.manager.findBy(OrderRequests_1.OrderRequests, where);
            },
        },
        ordersBy: {
            type: new graphql_1.GraphQLList(types_1.default),
            description: "list of orders",
            args: {
                id: { type: graphql_1.GraphQLInt },
                business_unit_id: { type: graphql_1.GraphQLInt },
                business_line_id: { type: graphql_1.GraphQLInt },
                order_request_id: { type: graphql_1.GraphQLInt },
                is_roll_off: { type: graphql_1.GraphQLBoolean },
                price_id: { type: graphql_1.GraphQLInt },
            },
            resolve: (args) => {
                let where = {};
                if (args.id) {
                    where.id = args.id;
                }
                if (args.business_unit_id) {
                    where.business_unit_id = args.business_unit_id;
                }
                if (args.business_line_id) {
                    where.business_line_id = args.business_line_id;
                }
                if (args.order_request_id) {
                    where.order_request_id = args.order_request_id;
                }
                if (args.is_roll_off) {
                    where.is_roll_off = args.is_roll_off;
                }
                if (args.price_id) {
                    where.price_id = args.price_id;
                }
                return data_source_1.AppDataSource.manager.findBy(Orders_1.Orders, where);
            },
        },
        pricesBy: {
            type: new graphql_1.GraphQLList(type_2.default),
            description: "List of price groups",
            args: {
                id: { type: graphql_1.GraphQLInt },
                price_group_id: { type: graphql_1.GraphQLInt },
                entity_type: { type: graphql_1.GraphQLString },
            },
            resolve: (args) => {
                let where = {};
                if (args.id) {
                    where.id = args.id;
                }
                if (args.price_group_id) {
                    where.price_group_id = args.price_group_id;
                }
                if (args.entity_type) {
                    where.entity_type = args.entity_type;
                }
                return data_source_1.AppDataSource.manager.findBy(Prices_1.Prices, where);
            },
        },
        recurrentOrderTemplateBy: {
            type: new graphql_1.GraphQLList(type_6.default),
            description: "List of recurrent order template",
            args: {
                id: { type: graphql_1.GraphQLInt },
                business_line_id: { type: graphql_1.GraphQLInt },
                business_unit_id: { type: graphql_1.GraphQLInt },
                status: { type: graphql_1.GraphQLString },
                price_group_id: { type: graphql_1.GraphQLInt },
                price_id: { type: graphql_1.GraphQLInt },
            },
            resolve: (args) => {
                let where = {};
                if (args.id) {
                    where.id = args.id;
                }
                if (args.business_line_id) {
                    where.business_line_id = args.business_line_id;
                }
                if (args.business_unit_id) {
                    where.business_unit_id = args.business_unit_id;
                }
                if (args.status) {
                    where.status = args.status;
                }
                if (args.price_group_id) {
                    where.price_group_id = args.price_group_id;
                }
                if (args.price_id) {
                    where.price_id = args.price_id;
                }
                return data_source_1.AppDataSource.manager.find(RecurrentOrderTemplates_1.RecurrentOrderTemplate);
            },
        },
        recurrentOrderTemplateHistoricalBy: {
            type: new graphql_1.GraphQLList(type_7.default),
            description: "List of recurrent order template historical",
            args: {
                id: { type: graphql_1.GraphQLInt },
                business_line_id: { type: graphql_1.GraphQLInt },
                business_unit_id: { type: graphql_1.GraphQLInt },
                status: { type: graphql_1.GraphQLString },
                price_group_id: { type: graphql_1.GraphQLInt },
                price_id: { type: graphql_1.GraphQLInt },
            },
            resolve: (args) => {
                let where = {};
                if (args.id) {
                    where.id = args.id;
                }
                if (args.business_line_id) {
                    where.business_line_id = args.business_line_id;
                }
                if (args.business_unit_id) {
                    where.business_unit_id = args.business_unit_id;
                }
                if (args.status) {
                    where.status = args.status;
                }
                if (args.price_group_id) {
                    where.price_group_id = args.price_group_id;
                }
                if (args.price_id) {
                    where.price_id = args.price_id;
                }
                return data_source_1.AppDataSource.manager.find(RecurrentOrderTemplatesHistorical_1.RecurrentOrderTemplateHistorical);
            },
        },
        recurrentOrderTemplateLineItemsBy: {
            type: new graphql_1.GraphQLList(type_8.default),
            description: "List of recurrent order template historical",
            args: {
                id: { type: graphql_1.GraphQLInt },
                recurrent_order_template_id: { type: graphql_1.GraphQLInt },
                price_id: { type: graphql_1.GraphQLInt },
            },
            resolve: (args) => {
                let where = {};
                if (args.id) {
                    where.id = args.id;
                }
                if (args.recurrent_order_template_id) {
                    where.recurrent_order_template_id = args.recurrent_order_template_id;
                }
                if (args.price_id) {
                    where.price_id = args.price_id;
                }
                return data_source_1.AppDataSource.manager.find(RecurrentOrderTemplateLineItems_1.RecurrentOrderTemplateLineItems);
            },
        },
        recurrentOrderTemplateLineItemsHistoricalBy: {
            type: new graphql_1.GraphQLList(type_9.default),
            description: "List of recurrent order template line items historical",
            args: {
                id: { type: graphql_1.GraphQLInt },
                recurrent_order_template_id: { type: graphql_1.GraphQLInt },
                price_id: { type: graphql_1.GraphQLInt },
            },
            resolve: (args) => {
                let where = {};
                if (args.id) {
                    where.id = args.id;
                }
                if (args.recurrent_order_template_id) {
                    where.recurrent_order_template_id = args.recurrent_order_template_id;
                }
                if (args.price_id) {
                    where.price_id = args.price_id;
                }
                return data_source_1.AppDataSource.manager.find(RecurrentOrderTemplateLineItemsHistorical_1.RecurrentOrderTemplateLineItemsHistorical);
            },
        },
        customRatesGroupsHistorical: {
            type: new graphql_1.GraphQLList(types_5.default),
            description: "list of custom rates groups historical",
            resolve: () => data_source_1.AppDataSource.manager.find(CustomRatesGroupsHistorical_1.CustomRatesGroupsHistorical),
        },
        customRatesGroups: {
            type: new graphql_1.GraphQLList(types_6.default),
            description: "list of custom rates groups",
            resolve: () => data_source_1.AppDataSource.manager.find(CustomRatesGroups_1.CustomRatesGroups),
        },
        customRatesGroupServices: {
            type: new graphql_1.GraphQLList(types_7.default),
            description: "list of custom rates groups services",
            resolve: () => data_source_1.AppDataSource.manager.find(CustomRatesGroupServices_1.CustomRatesGroupServices),
        },
        customRatesGroupsBy: {
            type: new graphql_1.GraphQLList(types_6.default),
            args: {
                id: { type: graphql_1.GraphQLInt },
                businessUnitId: { type: graphql_1.GraphQLInt },
                businessLineId: { type: graphql_1.GraphQLInt },
                customerGroupId: { type: graphql_1.GraphQLInt },
                customerId: { type: graphql_1.GraphQLInt },
                customerJobSiteId: { type: graphql_1.GraphQLInt },
                active: { type: graphql_1.GraphQLBoolean },
                skip: { type: graphql_1.GraphQLInt },
                limit: { type: graphql_1.GraphQLInt },
                type: { type: graphql_1.GraphQLString },
                serviceAreaIds: { type: new graphql_1.GraphQLList(graphql_1.GraphQLInt) },
            },
            description: "A single custom rates group",
            resolve: (parent, args) => (0, resolver_1.customRatesGroupsResolver)(args),
        },
        selectRatesGroup: {
            type: new graphql_1.GraphQLList(types_6.default),
            args: {
                businessUnitId: { type: graphql_1.GraphQLInt },
                businessLineId: { type: graphql_1.GraphQLInt },
                customerGroupId: { type: graphql_1.GraphQLInt },
                customerJobSiteId: { type: graphql_1.GraphQLInt },
                customerId: { type: graphql_1.GraphQLInt },
                serviceDate: { type: graphql_1.GraphQLString },
                serviceAreaId: { type: graphql_1.GraphQLInt },
            },
            description: "Select custom rates group",
            resolve: (parent, args) => (0, resolver_1.selectRatesGroupResolver)(args),
        },
    }),
});
let schema = new graphql_1.GraphQLSchema({
    query: RootQueryType,
});
exports.default = (0, koa_graphql_1.graphqlHTTP)({
    schema: schema,
    graphiql: true,
});
//# sourceMappingURL=index.js.map