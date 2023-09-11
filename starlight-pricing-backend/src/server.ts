import * as Router from 'koa-router';
import HealthCheckRoutes from './routes/health-check.routes';
import CreateTenant from './routes/create-tenant';
import SurchargeItemRoutes from './routes/surchargeItem/surchargeItem.routes';
import ThresholdItemsRoutes from './routes/thresholdItems/thresholdItems.routes';
import SubscriptionsPeriodsRoutes from './routes/subscriptionsPeriods/subscriptionsPeriods.routes';
import SubscriptionServiceItemsScheduleRoutes from './routes/subscriptionServiceItemsSchedule/subscriptionServiceItemsSchedule.routes';
import SubscriptionRecurringLineItemsScheduleRoutes from './routes/subscriptionRecurringLineItemsSchedule/subscriptionRecurringLineItemsSchedule.routes';
import SubscriptionOrdersLineItemsRoutes from './routes/subscriptionOrdersLineItems/subscriptionOrdersLineItems.routes';
import priceGroupsRoutes from './routes/priceGroups/priceGroups.routes';
import SubscriptionOrdersRoutes from './routes/subscriptionOrders/subscriptionOrders.routes';
import priceGroupsHistoricalRoutes from './routes/priceGroupsHistorical/priceGroupsHistorical.routes';
import lineItemsRoutes from './routes/lineItems/lineItems.routes';
import orderRequestRoutes from './routes/orderRequest/orderRequest.routes';
import invoicingRoutes from './routes/invoicing/invoicing.routes';
import ordersRoutes from './routes/orders/orders.routes';
import RecurrentOrderTemplateRoutes from './routes/recurrentOrderTemplate/recurrentOrderTemplate.routes';
import RecurrentOrderTemplateHistoricalRoutes from './routes/recurrentOrderTemplateHistorical/recurrentOrderTemplateHistorical.routes';
import recurrentOrderTemplateLineItemsRoutes from './routes/recurrentOrderTemplateLineItems/recurrentOrderTemplateLineItems.routes';
import recurrentOrderTemplateLineItemsHistoricalRoutes from './routes/recurrentOrderTemplateLineItemsHistorical/recurrentOrderTemplateLineItemsHistorical.routes';
import pricesRoutes from './routes/prices/prices.routes';
import customRatesGroups from './routes/customRatesGroups/customRatesGroups.routes';
import customRatesGroupThresholds from './routes/customRatesGroupThresholds/customRatesGroupThresholds.routes';
import customRatesGroupSurcharges from './routes/customRatesGroupSurcharges/customRatesGroupSurcharges.routes';
import graphql from './graphql';
import customRatesGroupLineItemsRoutes from './routes/customRatesGroupLineItems/customRatesGroupLineItems.routes';
import customRatesGroupLineItemsHistoricalRoutes from './routes/customRatesGroupLineItemsHistorical/customRatesGroupLineItemsHistorical.routes';
import customRatesGroupRecurringLineItemsBillingCycleRoutes from './routes/customRatesGroupRecurringLineItemsBillingCycle/customRatesGroupRecurringLineItemsBillingCycle.routes';
import customRatesGroupRecurringLineItemsBillingCycleHistoricalRoutes from './routes/customRatesGroupRecurringLineItemsBillingCycleHistorical/customRatesGroupRecurringLineItemsBillingCycleHistorical.routes';
import customRatesGroupServicesRoutes from './routes/customRatesGroupServices/customRatesGroupServices.routes';
import customRatesGroupRecurringServiceFrequencyRoutes from './routes/customRatesGroupRecurringServiceFrequency/customRatesGroupRecurringServiceFrequency.routes';
import customRatesGroupRecurringServiceFrequencyHistoricalRoutes from './routes/customRatesGroupRecurringServiceFrequencyHistorical/customRatesGroupRecurringServiceFrequencyHistorical.routes';
import orderTaxDistrictRoutes from './routes/orderTaxDistrict/orderTaxDistrict.routes';
import orderTaxDistrictTaxesRoutes from './routes/orderTaxDistrictTaxes/orderTaxDistrictTaxes.routes';
import recurrentOrderTemplateOrderRoutes from './routes/recurrentOrderTemplateOrder/recurrentOrderTemplateOrder.routes';
import subscriptionsRoutes from './routes/subscriptions/subscriptions.routes';
import subscriptionServiceItemRoutes from './routes/subscriptionServiceItem/subscriptionServiceItem.routes';
import subscriptionLineItemRoutes from './routes/subscriptionLineItem/subscriptionLineItem.routes';
import subscriptionHistoryRoutes from './routes/subscriptionHistory/subscriptionHistory.routes';
import subscriptionSurchargesRoutes from './routes/subscriptionSurcharges/subscriptionSurcharges.routes';
import subscriptionOrderMediaRoutes from './routes/subscriptionOrderMedia/subscriptionOrderMedia.routes';
import subscriptionWorkOrderMediaRoutes from './routes/subscriptionWorkOrderMedia/subscriptionWorkOrderMedia.routes';
import subscriptionWorkOrderRoutes from './routes/subscriptionWorkOrder/subscriptionWorkOrder.routes';
import SubscriptionWorkOrdersLineItemsRoutes from './routes/subscriptionWorkOrdersLineItems/subscriptionWorkOrdersLineItems.routes';
const router = new Router();

router.use('/health-check', HealthCheckRoutes);
router.use('/create-tenant', CreateTenant);
router.use('/api/pricing/priceGroup', priceGroupsRoutes);
router.use('/api/pricing/thresholdItems', ThresholdItemsRoutes);
router.use('/api/pricing/surchargeItems', SurchargeItemRoutes);
router.use('/api/pricing/subscriptionsPeriods', SubscriptionsPeriodsRoutes);
router.use('/api/pricing/subscriptionServiceItemsSchedule', SubscriptionServiceItemsScheduleRoutes);
router.use(
  '/api/pricing/subscriptionRecurringLineItemsSchedule',
  SubscriptionRecurringLineItemsScheduleRoutes,
);
router.use('/api/pricing/subscriptionOrderLineItems', SubscriptionOrdersLineItemsRoutes);
router.use('/api/pricing/subscriptionOrders', SubscriptionOrdersRoutes);
router.use('/api/pricing/recurrent-orders', RecurrentOrderTemplateRoutes);
router.use('/api/pricing/recurrentOrderTemplateHistorical', RecurrentOrderTemplateHistoricalRoutes);
router.use('/api/pricing/recurrentOrderTemplateLineItems', recurrentOrderTemplateLineItemsRoutes);
router.use(
  '/api/pricing/recurrentOrderTemplateLineItemsHistorical',
  recurrentOrderTemplateLineItemsHistoricalRoutes,
);

router.use('/api/pricing/priceGroupHistorical', priceGroupsHistoricalRoutes);
router.use('/api/pricing/lineItems', lineItemsRoutes);
router.use('/api/pricing/orderRequest', orderRequestRoutes);
router.use('/api/pricing/orders/invoicing', invoicingRoutes);
router.use('/api/pricing/orders', ordersRoutes);
router.use('/api/pricing/price', pricesRoutes);
router.use('/api/pricing/rates', customRatesGroups);
router.use('/api/pricing/customRatesGroup', customRatesGroups);
router.use('/api/pricing/customRatesGroupThresholds', customRatesGroupThresholds);
router.use('/api/pricing/customRatesGroupSurcharges', customRatesGroupSurcharges);

router.all('/api/pricing/graphql', graphql);

router.use('/api/pricing/customRatesGroupLineItems', customRatesGroupLineItemsRoutes);
router.use(
  '/api/pricing/customRatesGroupLineItemsHistorical',
  customRatesGroupLineItemsHistoricalRoutes,
);

router.use(
  '/api/pricing/customRatesGroupRecurringLineItemBillingCycle',
  customRatesGroupRecurringLineItemsBillingCycleRoutes,
);
router.use(
  '/api/pricing/customRatesGroupRecurringLineItemBillingCycleHistorical',
  customRatesGroupRecurringLineItemsBillingCycleHistoricalRoutes,
);

router.use('/api/pricing/customRatesGroupServices', customRatesGroupServicesRoutes);
router.use(
  '/api/pricing/customRatesGroupRecurringServiceFrecuency',
  customRatesGroupRecurringServiceFrequencyRoutes,
);
router.use(
  '/api/pricing/customRatesGroupRecurringServiceFrecuencyHistorical',
  customRatesGroupRecurringServiceFrequencyHistoricalRoutes,
);
router.use('/api/pricing/orderTaxDistrict', orderTaxDistrictRoutes);
router.use('/api/pricing/orderTaxDistrictTaxes', orderTaxDistrictTaxesRoutes);

router.use('/api/pricing/recurrentOrderTemplateOrder', recurrentOrderTemplateOrderRoutes);

router.use('/api/pricing/subscriptions', subscriptionsRoutes);
router.use('/api/pricing/subscriptionServiceItem', subscriptionServiceItemRoutes);
router.use('/api/pricing/subscriptionLineItem', subscriptionLineItemRoutes);

router.use('/api/pricing/subscriptionHistory', subscriptionHistoryRoutes);
router.use('/api/pricing/subscriptionSurcharge', subscriptionSurchargesRoutes);
router.use('/api/pricing/subscriptionOrderMedia', subscriptionOrderMediaRoutes);
router.use('/api/pricing/subscriptionWorkOrder', subscriptionWorkOrderRoutes);
router.use('/api/pricing/subscriptionWorkOrderMedia', subscriptionWorkOrderMediaRoutes);
router.all('/api/pricing/subscriptionWorkOrderLineItems', SubscriptionWorkOrdersLineItemsRoutes);

export default router;
