import { SurchargeItemHistorical } from './tenant/SurchargeItemHistorical';
import { PriceGroups } from './tenant/PriceGroups';
import { PriceGroupsHistorical } from './tenant/PriceGroupsHistorical';
import { Prices } from './tenant/Prices';
import { Orders } from './tenant/Orders';
import { LineItems } from './tenant/LineItems';
import { ThresholdItems } from './tenant/ThresholdItems';
import { SurchargeItem } from './tenant/SurchargeItem';
import { OrderRequests } from './tenant/OrderRequests';
import { OrdersHistorical } from './tenant/OrdersHistorical';
import { Subscriptions } from './tenant/Subscriptions';
import { SubscriptionsHistorical } from './tenant/SubscriptionsHistorical';
import { SubscriptionHistory } from './tenant/SubscriptionHistory';
import { SubscriptionLineItem } from './tenant/SubscriptionLineItem';
import { SubscriptionsMedia } from './tenant/SubscriptionsMedia';
import { SubscriptionsMediaHistorical } from './tenant/SubscriptionsMediaHistorical';
import { SubscriptionServiceItem } from './tenant/SubscriptionServiceItem';
import { SubscriptionSurchargeItem } from './tenant/SubscriptionSurchargeItem';
import { SubscriptionSurchargeItemHistorical } from './tenant/SubscriptionSurchargeItemHistorical';
import { SubscriptionWorkOrders } from './tenant/SubscriptionWorkOrders';
import { SubscriptionWorkOrdersHistorical } from './tenant/SubscriptionWorkOrdersHistorical';
import { SubscriptionWorkOrdersLineItems } from './tenant/SubscriptionWorkOrdersLineItems';
import { SubscriptionWorkOrdersLineItemsHistorical } from './tenant/SubscriptionWorkOrdersLineItemsHistorical';
import { SubscriptionWorkOrdersMedia } from './tenant/SubscriptionWorkOrdersMedia';
import { SubscriptionWorkOrdersMediaHistorical } from './tenant/SubscriptionWorkOrdersMediaHistorical';
import { SubscriptionServiceItemsSchedule } from './tenant/SubscriptionServiceItemsSchedule';
import { SubscriptionRecurringLineItemsSchedule } from './tenant/SubscriptionRecurringLineItemsSchedule';
import { SubscriptionsPeriods } from './tenant/SubscriptionsPeriods';
import { SubscriptionOrders } from './tenant/SubscriptionOrders';
import { SubscriptionOrdersHistorical } from './tenant/SubscriptionOrdersHistorical';
import { SubscriptionOrdersLineItems } from './tenant/SubscriptionOrdersLineItems';
import { SubscriptionOrdersLineItemsHistorical } from './tenant/SubscriptionOrdersLineItemsHistorical';
import { RecurrentOrderTemplateLineItemsHistorical } from './tenant/RecurrentOrderTemplateLineItemsHistorical';
import { RecurrentOrderTemplateLineItems } from './tenant/RecurrentOrderTemplateLineItems';
import { RecurrentOrderTemplate } from './tenant/RecurrentOrderTemplates';
import { RecurrentOrderTemplateHistorical } from './tenant/RecurrentOrderTemplatesHistorical';
import { CustomRatesGroupsHistorical } from './tenant/CustomRatesGroupsHistorical';
import { CustomRatesGroups } from './tenant/CustomRatesGroups';
import { CustomRatesGroupThresholdsHistorical } from './tenant/CustomRatesGroupThresholdsHistorical';
import { CustomRatesGroupThresholds } from './tenant/CustomRatesGroupThresholds';
import { CustomRatesGroupSurcharges } from './tenant/CustomRatesGroupSurcharges';
import { CustomRatesGroupSurchargesHistorical } from './tenant/CustomRatesGroupSurchargesHistorical';
import { CustomRatesGroupServiceHistorical } from './tenant/CustomRatesGroupServicesHistorical';
import { CustomRatesGroupLineItems } from './tenant/CustomRatesGroupLineItems';
import { CustomRatesGroupLineItemsHistorical } from './tenant/CustomRatesGroupLineItemsHistorical';
import { CustomRatesGroupRecurringLineItemBillingCycle } from './tenant/CustomRatesGroupRecurringLineItemBillingCycle';
import { CustomRatesGroupRecurringLineItemBillingCycleHistorical } from './tenant/CustomRatesGroupRecurringLineItemBillingCycleHistorical';
import { CustomRatesGroupServices } from './tenant/CustomRatesGroupServices';
import { CustomRatesGroupRecurringServiceFrequency } from './tenant/CustomRatesGroupRecurringServiceFrequency';
import { CustomRatesGroupRecurringServiceFrequencyHistorical } from './tenant/CustomRatesGroupRecurringServiceFrequencyHistorical';
import { ServiceAreasCustomRatesGroups } from './tenant/ServiceAreasCustomRatesGroups';
import { OrderTaxDistrict } from './tenant/OrderTaxDistrict';
import { OrderTaxDistrictTaxes } from './tenant/OrderTaxDistrictTaxes';
import { ThresholdItemsHistorical } from './tenant/ThresholdItemsHistorical';
import { RecurrentOrderTemplateOrder } from './tenant/RecurrentOrderTemplateOrder';
import { SubscriptionServiceItemHistorical } from './tenant/SubscriptionServiceItemHistorical';
import { SubscriptionLineItemHistorical } from './tenant/SubscriptionLineItemHistorical';
import { SubscriptionOrderMedia } from './tenant/SubscriptionOrdersMedia';
import { SubscriptionOrderMediaHistorical } from './tenant/SubscriptionOrdersMediaHistorical';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class Entity {
  public static entities = [
    PriceGroups,
    PriceGroupsHistorical,
    Prices,
    Orders,
    OrdersHistorical,
    LineItems,
    ThresholdItems,
    SurchargeItem,
    OrderRequests,

    OrderTaxDistrict,
    OrderTaxDistrictTaxes,
    SurchargeItemHistorical,
    ThresholdItemsHistorical,
    RecurrentOrderTemplateOrder,

    CustomRatesGroups,
    CustomRatesGroupsHistorical,

    Subscriptions,
    SubscriptionHistory,
    SubscriptionsHistorical,
    SubscriptionLineItem,
    SubscriptionLineItemHistorical,
    SubscriptionsMedia,
    SubscriptionsMediaHistorical,
    SubscriptionServiceItem,
    SubscriptionServiceItemHistorical,
    SubscriptionSurchargeItem,
    SubscriptionSurchargeItemHistorical,
    SubscriptionWorkOrders,
    SubscriptionWorkOrdersHistorical,
    SubscriptionWorkOrdersLineItems,
    SubscriptionWorkOrdersLineItemsHistorical,
    SubscriptionWorkOrdersMedia,
    SubscriptionWorkOrdersMediaHistorical,
    SubscriptionServiceItemsSchedule,
    SubscriptionRecurringLineItemsSchedule,
    SubscriptionsPeriods,
    SubscriptionOrders,
    SubscriptionOrdersHistorical,
    SubscriptionOrdersLineItems,
    SubscriptionOrdersLineItemsHistorical,
    SubscriptionOrderMedia,
    SubscriptionOrderMediaHistorical,
    RecurrentOrderTemplateLineItemsHistorical,
    RecurrentOrderTemplateLineItems,
    RecurrentOrderTemplate,
    RecurrentOrderTemplateHistorical,
    CustomRatesGroupThresholds,
    CustomRatesGroupThresholdsHistorical,
    CustomRatesGroupSurcharges,
    CustomRatesGroupSurchargesHistorical,
    CustomRatesGroupServiceHistorical,
    CustomRatesGroupLineItems,
    CustomRatesGroupLineItemsHistorical,
    CustomRatesGroupRecurringLineItemBillingCycle,
    CustomRatesGroupRecurringLineItemBillingCycleHistorical,
    CustomRatesGroupServices,
    CustomRatesGroupRecurringServiceFrequency,
    CustomRatesGroupRecurringServiceFrequencyHistorical,
    ServiceAreasCustomRatesGroups,
  ];
}
