"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SurchargeItemHistorical_1 = require("./tenant/SurchargeItemHistorical");
const PriceGroups_1 = require("./tenant/PriceGroups");
const PriceGroupsHistorical_1 = require("./tenant/PriceGroupsHistorical");
const Prices_1 = require("./tenant/Prices");
const Orders_1 = require("./tenant/Orders");
const LineItems_1 = require("./tenant/LineItems");
const ThresholdItems_1 = require("./tenant/ThresholdItems");
const SurchargeItem_1 = require("./tenant/SurchargeItem");
const OrderRequests_1 = require("./tenant/OrderRequests");
const OrdersHistorical_1 = require("./tenant/OrdersHistorical");
const Subscriptions_1 = require("./tenant/Subscriptions");
const SubscriptionsHistorical_1 = require("./tenant/SubscriptionsHistorical");
const SubscriptionHistory_1 = require("./tenant/SubscriptionHistory");
const SubscriptionLineItem_1 = require("./tenant/SubscriptionLineItem");
const SubscriptionsMedia_1 = require("./tenant/SubscriptionsMedia");
const SubscriptionsMediaHistorical_1 = require("./tenant/SubscriptionsMediaHistorical");
const SubscriptionServiceItem_1 = require("./tenant/SubscriptionServiceItem");
const SubscriptionSurchargeItem_1 = require("./tenant/SubscriptionSurchargeItem");
const SubscriptionSurchargeItemHistorical_1 = require("./tenant/SubscriptionSurchargeItemHistorical");
const SubscriptionWorkOrders_1 = require("./tenant/SubscriptionWorkOrders");
const SubscriptionWorkOrdersHistorical_1 = require("./tenant/SubscriptionWorkOrdersHistorical");
const SubscriptionWorkOrdersLineItems_1 = require("./tenant/SubscriptionWorkOrdersLineItems");
const SubscriptionWorkOrdersLineItemsHistorical_1 = require("./tenant/SubscriptionWorkOrdersLineItemsHistorical");
const SubscriptionWorkOrdersMedia_1 = require("./tenant/SubscriptionWorkOrdersMedia");
const SubscriptionWorkOrdersMediaHistorical_1 = require("./tenant/SubscriptionWorkOrdersMediaHistorical");
const SubscriptionServiceItemsSchedule_1 = require("./tenant/SubscriptionServiceItemsSchedule");
const SubscriptionRecurringLineItemsSchedule_1 = require("./tenant/SubscriptionRecurringLineItemsSchedule");
const SubscriptionsPeriods_1 = require("./tenant/SubscriptionsPeriods");
const SubscriptionOrders_1 = require("./tenant/SubscriptionOrders");
const SubscriptionOrdersHistorical_1 = require("./tenant/SubscriptionOrdersHistorical");
const SubscriptionOrdersLineItems_1 = require("./tenant/SubscriptionOrdersLineItems");
const SubscriptionOrdersLineItemsHistorical_1 = require("./tenant/SubscriptionOrdersLineItemsHistorical");
const RecurrentOrderTemplateLineItemsHistorical_1 = require("./tenant/RecurrentOrderTemplateLineItemsHistorical");
const RecurrentOrderTemplateLineItems_1 = require("./tenant/RecurrentOrderTemplateLineItems");
const RecurrentOrderTemplates_1 = require("./tenant/RecurrentOrderTemplates");
const RecurrentOrderTemplatesHistorical_1 = require("./tenant/RecurrentOrderTemplatesHistorical");
const CustomRatesGroupsHistorical_1 = require("./tenant/CustomRatesGroupsHistorical");
const CustomRatesGroups_1 = require("./tenant/CustomRatesGroups");
const CustomRatesGroupThresholdsHistorical_1 = require("./tenant/CustomRatesGroupThresholdsHistorical");
const CustomRatesGroupThresholds_1 = require("./tenant/CustomRatesGroupThresholds");
const CustomRatesGroupSurcharges_1 = require("./tenant/CustomRatesGroupSurcharges");
const CustomRatesGroupSurchargesHistorical_1 = require("./tenant/CustomRatesGroupSurchargesHistorical");
const CustomRatesGroupServicesHistorical_1 = require("./tenant/CustomRatesGroupServicesHistorical");
const CustomRatesGroupLineItems_1 = require("./tenant/CustomRatesGroupLineItems");
const CustomRatesGroupLineItemsHistorical_1 = require("./tenant/CustomRatesGroupLineItemsHistorical");
const CustomRatesGroupRecurringLineItemBillingCycle_1 = require("./tenant/CustomRatesGroupRecurringLineItemBillingCycle");
const CustomRatesGroupRecurringLineItemBillingCycleHistorical_1 = require("./tenant/CustomRatesGroupRecurringLineItemBillingCycleHistorical");
const CustomRatesGroupServices_1 = require("./tenant/CustomRatesGroupServices");
const CustomRatesGroupRecurringServiceFrequency_1 = require("./tenant/CustomRatesGroupRecurringServiceFrequency");
const CustomRatesGroupRecurringServiceFrequencyHistorical_1 = require("./tenant/CustomRatesGroupRecurringServiceFrequencyHistorical");
const ServiceAreasCustomRatesGroups_1 = require("./tenant/ServiceAreasCustomRatesGroups");
const OrderTaxDistrict_1 = require("./tenant/OrderTaxDistrict");
const OrderTaxDistrictTaxes_1 = require("./tenant/OrderTaxDistrictTaxes");
const ThresholdItemsHistorical_1 = require("./tenant/ThresholdItemsHistorical");
const RecurrentOrderTemplateOrder_1 = require("./tenant/RecurrentOrderTemplateOrder");
const SubscriptionServiceItemHistorical_1 = require("./tenant/SubscriptionServiceItemHistorical");
const SubscriptionLineItemHistorical_1 = require("./tenant/SubscriptionLineItemHistorical");
const SubscriptionOrdersMedia_1 = require("./tenant/SubscriptionOrdersMedia");
const SubscriptionOrdersMediaHistorical_1 = require("./tenant/SubscriptionOrdersMediaHistorical");
class Entity {
}
exports.default = Entity;
Entity.entities = [
    PriceGroups_1.PriceGroups,
    PriceGroupsHistorical_1.PriceGroupsHistorical,
    Prices_1.Prices,
    Orders_1.Orders,
    OrdersHistorical_1.OrdersHistorical,
    LineItems_1.LineItems,
    ThresholdItems_1.ThresholdItems,
    SurchargeItem_1.SurchargeItem,
    OrderRequests_1.OrderRequests,
    OrderTaxDistrict_1.OrderTaxDistrict,
    OrderTaxDistrictTaxes_1.OrderTaxDistrictTaxes,
    SurchargeItemHistorical_1.SurchargeItemHistorical,
    ThresholdItemsHistorical_1.ThresholdItemsHistorical,
    RecurrentOrderTemplateOrder_1.RecurrentOrderTemplateOrder,
    CustomRatesGroups_1.CustomRatesGroups,
    CustomRatesGroupsHistorical_1.CustomRatesGroupsHistorical,
    Subscriptions_1.Subscriptions,
    SubscriptionHistory_1.SubscriptionHistory,
    SubscriptionsHistorical_1.SubscriptionsHistorical,
    SubscriptionLineItem_1.SubscriptionLineItem,
    SubscriptionLineItemHistorical_1.SubscriptionLineItemHistorical,
    SubscriptionsMedia_1.SubscriptionsMedia,
    SubscriptionsMediaHistorical_1.SubscriptionsMediaHistorical,
    SubscriptionServiceItem_1.SubscriptionServiceItem,
    SubscriptionServiceItemHistorical_1.SubscriptionServiceItemHistorical,
    SubscriptionSurchargeItem_1.SubscriptionSurchargeItem,
    SubscriptionSurchargeItemHistorical_1.SubscriptionSurchargeItemHistorical,
    SubscriptionWorkOrders_1.SubscriptionWorkOrders,
    SubscriptionWorkOrdersHistorical_1.SubscriptionWorkOrdersHistorical,
    SubscriptionWorkOrdersLineItems_1.SubscriptionWorkOrdersLineItems,
    SubscriptionWorkOrdersLineItemsHistorical_1.SubscriptionWorkOrdersLineItemsHistorical,
    SubscriptionWorkOrdersMedia_1.SubscriptionWorkOrdersMedia,
    SubscriptionWorkOrdersMediaHistorical_1.SubscriptionWorkOrdersMediaHistorical,
    SubscriptionServiceItemsSchedule_1.SubscriptionServiceItemsSchedule,
    SubscriptionRecurringLineItemsSchedule_1.SubscriptionRecurringLineItemsSchedule,
    SubscriptionsPeriods_1.SubscriptionsPeriods,
    SubscriptionOrders_1.SubscriptionOrders,
    SubscriptionOrdersHistorical_1.SubscriptionOrdersHistorical,
    SubscriptionOrdersLineItems_1.SubscriptionOrdersLineItems,
    SubscriptionOrdersLineItemsHistorical_1.SubscriptionOrdersLineItemsHistorical,
    SubscriptionOrdersMedia_1.SubscriptionOrderMedia,
    SubscriptionOrdersMediaHistorical_1.SubscriptionOrderMediaHistorical,
    RecurrentOrderTemplateLineItemsHistorical_1.RecurrentOrderTemplateLineItemsHistorical,
    RecurrentOrderTemplateLineItems_1.RecurrentOrderTemplateLineItems,
    RecurrentOrderTemplates_1.RecurrentOrderTemplate,
    RecurrentOrderTemplatesHistorical_1.RecurrentOrderTemplateHistorical,
    CustomRatesGroupThresholds_1.CustomRatesGroupThresholds,
    CustomRatesGroupThresholdsHistorical_1.CustomRatesGroupThresholdsHistorical,
    CustomRatesGroupSurcharges_1.CustomRatesGroupSurcharges,
    CustomRatesGroupSurchargesHistorical_1.CustomRatesGroupSurchargesHistorical,
    CustomRatesGroupServicesHistorical_1.CustomRatesGroupServiceHistorical,
    CustomRatesGroupLineItems_1.CustomRatesGroupLineItems,
    CustomRatesGroupLineItemsHistorical_1.CustomRatesGroupLineItemsHistorical,
    CustomRatesGroupRecurringLineItemBillingCycle_1.CustomRatesGroupRecurringLineItemBillingCycle,
    CustomRatesGroupRecurringLineItemBillingCycleHistorical_1.CustomRatesGroupRecurringLineItemBillingCycleHistorical,
    CustomRatesGroupServices_1.CustomRatesGroupServices,
    CustomRatesGroupRecurringServiceFrequency_1.CustomRatesGroupRecurringServiceFrequency,
    CustomRatesGroupRecurringServiceFrequencyHistorical_1.CustomRatesGroupRecurringServiceFrequencyHistorical,
    ServiceAreasCustomRatesGroups_1.ServiceAreasCustomRatesGroups,
];
//# sourceMappingURL=_entitiesTenant.js.map