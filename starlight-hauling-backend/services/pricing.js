import { makePricingRequest } from '../utils/makeRequest.js';

export const getPriceGroups = ctx =>
  makePricingRequest(ctx, {
    method: 'get',
    url: `/priceGroup`,
  });

export const pricingAddRecurrentOrder = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'post',
    url: `/recurrent-orders`,
    data,
  });

export const pricingGetPriceOrder = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'get',
    url: `/orders`,
    data,
  });

export const pricingGetPriceOrderQuery = (ctx, { data, filterQuery }) =>
  makePricingRequest(ctx, {
    method: 'get',
    url: `/orders${filterQuery}`,
    data,
  });

export const pricingPutOrderState = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'put',
    url: `/orders/update/state`,
    data,
  });

export const pricingGetInvoicedOrder = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'get',
    url: `/orders/invoiced`,
    data,
  });

export const pricingGetOrderHistory = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'get',
    url: `/orders/history`,
    data,
  });

export const pricingGetOrderReduced = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'get',
    url: `/orders/reduced`,
    data,
  });

export const pricingAddOrder = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'post',
    url: `/orders`,
    data,
  });

export const pricingAlterOrder = (ctx, { data }, id) =>
  makePricingRequest(ctx, {
    method: 'put',
    url: `/orders/${id}`,
    data,
  });

export const pricingUnfinalizeOrder = (ctx, { data }, id) =>
  makePricingRequest(ctx, {
    method: 'put',
    url: `/orders/${id}/unfinalize`,
    data,
  });

export const pricingApproveOrder = (ctx, id) =>
  makePricingRequest(ctx, {
    method: 'post',
    url: `/orders/${id}/approve`,
  });
export const pricingAlterOrderCascade = (ctx, { data }, id) =>
  makePricingRequest(ctx, {
    method: 'put',
    url: `/orders/${id}/cascade`,
    data,
  });
export const pricingDeleteOrder = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'delete',
    url: `/orders/${data}/cascade`,
    data,
  });

export const pricingGetLineItems = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'get',
    url: `/lineItems/by`,
    data,
  });
export const pricingAddLineItems = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'post',
    url: `/lineItems/bulk`,
    data,
  });

export const pricingAddOneLineItems = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'post',
    url: `/lineItems`,
    data,
  });
export const pricingDeleteLineItems = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'delete',
    url: `/lineItems`,
    data,
  });

export const pricingUpsertLineItems = (ctx, { data }) => {
  if (data.data.length === 0) {
    return '';
  }
  return makePricingRequest(ctx, {
    method: 'post',
    url: `/lineItems/upsert`,
    data,
  });
};

export const pricingGetByOrderTaxDistrict = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'get',
    url: `/orderTaxDistrict/by`,
    data,
  });

export const pricingAddOrderTaxDistrict = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'post',
    url: `/orderTaxDistrict/bulk`,
    data,
  });
export const pricingGetOrderTaxDistrict = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'get',
    url: `/orderTaxDistrict/`,
    data,
  });

export const pricingAddThreshold = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'post',
    url: `/thresholdItems/bulk`,
    data,
  });

export const pricingUpsertThreshold = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'post',
    url: `/thresholdItems/upsert`,
    data,
  });
export const pricingDeleteThreshold = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'delete',
    url: `/thresholdItems/`,
    data,
  });

export const pricingGetThreshold = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'get',
    url: `/thresholdItems/by`,
    data,
  });

export const pricingAddSurcharge = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'post',
    url: `/surchargeItems/bulk`,
    data,
  });
export const pricingAddRecurrentOrderTemplateOrder = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'post',
    url: `/recurrentOrderTemplateOrder`,
    data,
  });

export const pricingGetRecurrentOrderTemplate = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'get',
    url: `/recurrent-orders`,
    data,
  });

export const pricingAddRecurrentOrderTemplateLineItems = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'post',
    url: `/recurrentOrderTemplateLineItems/bulk`,
    data,
  });
export const pricingGetDataForGeneration = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'get',
    url: `/recurrent-orders/getDataForGeneration`,
    data,
  });

export const pricingBulkAddRecurrentOrderTemplateOrder = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'post',
    url: `/recurrentOrderTemplateOrder/bulk`,
    data,
  });

export const pricingAlterRecurrentOrderTemplate = (ctx, { data }, id) =>
  makePricingRequest(ctx, {
    method: 'put',
    url: `/recurrent-orders/${id}`,
    data,
  });

export const pricingDeleteRecurrentOrderTemplateOrder = (ctx, id) =>
  makePricingRequest(ctx, {
    method: 'delete',
    url: `/recurrentOrderTemplateOrder?id=${id}`,
  });

export const pricingDeleteRecurrentOrderTemplate = (ctx, id) =>
  makePricingRequest(ctx, {
    method: 'delete',
    url: `/recurrent-orders?id=${id}`,
  });

export const pricingDeleteRecurrentOrderTemplateLineItems = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'delete',
    url: `/recurrentOrderTemplateLineItems`,
    data,
  });

export const pricingUpsertSurcharge = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'post',
    url: `/surchargeItems/upsert`,
    data,
  });

export const pricingCountNotFinalized = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'get',
    url: `/recurrentOrderTemplateOrder/countNotFinalized`,
    data,
  });

export const pricingGetOrderByOrderTemplate = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'get',
    url: `/orders/byOrderTemplate`,
    data,
  });

export const pricingUpsertRecurrentOrderTemplateLineItems = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'post',
    url: `/recurrentOrderTemplateLineItems/upsert`,
    data,
  });

export const pricingAddSubscriptions = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'post',
    url: `/subscriptions`,
    data,
  });

export const pricingAddDraftSubscriptions = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'post',
    url: `/subscriptions/draft`,
    data,
  });

export const pricingAlterSubscriptions = (ctx, { data }, id) =>
  makePricingRequest(ctx, {
    method: 'put',
    url: `/subscriptions/${id}`,
    data,
  });

export const pricingDeleteSubscriptions = (ctx, id) =>
  makePricingRequest(ctx, {
    method: 'delete',
    url: `/subscriptions?id=${id}`,
  });

export const pricingBulkAddSubscriptionServiceItem = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'post',
    url: `/subscriptionServiceItem/bulk`,
    data,
  });

export const pricingDeleteSubscriptionServiceItem = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'delete',
    url: `/subscriptionServiceItem/`,
    data,
  });

export const pricingAddSubscriptionServiceItem = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'post',
    url: `/subscriptionServiceItem/`,
    data,
  });

export const pricingGetSubscriptionServiceItemById = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'get',
    url: `/subscriptionServiceItem/byId`,
    data,
  });

export const pricingGetSubscriptionServiceItemBy = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'get',
    url: `/subscriptionServiceItem/by`,
    data,
  });

export const pricingGetSubscriptionsDetailsForRoutePlanner = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'get',
    url: `/subscriptionServiceItem/routePlanner`,
    data,
  });

export const pricingGetSubscriptionOrderDetailsForRoutePlanner = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'get',
    url: `/subscriptionOrders/routePlanner`,
    data,
  });

export const pricingUpsertSubsServiceItem = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'post',
    url: `/subscriptionServiceItem/upsert`,
    data,
  });

export const pricingUpsertSubsLineeItem = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'post',
    url: `/subscriptionLineItem/upsert`,
    data,
  });

export const pricingBulkAddSubscriptionLineItem = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'post',
    url: `/subscriptionLineItem/bulk`,
    data,
  });

export const pricingBulkAddSubscriptionOrder = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'post',
    url: `/subscriptionOrders/bulk`,
    data,
  });

export const pricingSequenceCount = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'get',
    url: `/subscriptionOrders/sequenceCount`,
    data,
  });

export const pricingAddSubscriptionHistory = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'post',
    url: `/subscriptionHistory`,
    data,
  });
export const pricingGetOrdersCount = (ctx, query) =>
  makePricingRequest(ctx, {
    method: 'get',
    url: `/orders/count${query}`,
  });
export const pricingGetSubscriptionsPaginated = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'get',
    url: `/subscriptions`,
    data,
  });

export const pricingGetSubscriptionsToInvoice = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'get',
    url: `/subscriptions/toinvoice`,
    data,
  });

export const pricingGetStreamTenantSubscriptionsByTennat = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'get',
    url: `/subscriptions/stream/tenant`,
    data,
  });

export const pricingGetSubscriptionById = (ctx, data) =>
  makePricingRequest(ctx, {
    method: 'get',
    url: `/subscriptions/${data.id}/details`,
    data,
  });

export const subscriptionServiceItemsById = (ctx, data) =>
  makePricingRequest(ctx, {
    method: 'get',
    url: `/subscriptionServiceItem/${data.id}/ids`,
    data,
  });

export const pricingGetDraftSubscriptionById = (ctx, data) =>
  makePricingRequest(ctx, {
    method: 'get',
    url: `/subscriptions/draft/${data.id}`,
    data,
  });

export const pricingAddSubscriptionOrder = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'post',
    url: `/subscriptionOrders`,
    data,
  });

export const pricingUpdateSubscriptionOrder = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'put',
    url: `/subscriptionOrders/${data.id}`,
    data,
  });

export const pricingUpdateSubscriptionOrderBySubId = (ctx, { data }, subscriptionId) =>
  makePricingRequest(ctx, {
    method: 'put',
    url: `/subscriptionOrders/${subscriptionId}/update`,
    data,
  });

export const pricingGetSubscriptionsOrdersPaginated = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'get',
    url: `/subscriptionOrders/${data.subscriptionId}/orders/`,
    data,
  });

export const pricingGetSubscriptionsOrdersBy = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'get',
    url: `/subscriptionOrders/by/`,
    data,
  });

export const pricingPostManySubscriptionOrderLineItems = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'post',
    url: `/subscriptionOrderLineItems/bulk`,
    data,
  });

export const pricingGetSubscriptionSingle = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'get',
    url: `/subscriptions/${data.id}`,
    data,
  });

export const pricingGetSubscriptionOrderById = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'get',
    url: `/subscriptionOrders/${data.id}`,
  });

export const pricingUpsertSubscriptionSurcharges = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'post',
    url: `/subscriptionSurcharge/upsert`,
    data,
  });

export const pricingGetSubscriptionsOrders = (ctx, { data, query = '' }) =>
  makePricingRequest(ctx, {
    method: 'get',
    url: `/subscriptionOrders${query}`,
    data,
  });

export const pricingGetAllSubscriptionOrdersByIds = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'get',
    url: `/subscriptionOrders/allByIds`,
    data,
  });

export const pricingGetBySubscriptionIds = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'get',
    url: `/subscriptionOrders/bySubscriptionsIds`,
    data,
  });

export const pricingSoftDeleteSubscriptionOrder = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'post',
    url: `/subscriptionOrders/softDelete`,
    data,
  });

export const pricingAlterStatusByIds = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'post',
    url: `/subscriptionOrders/updateStatusByIds`,
    data,
  });

export const pricingSoftDeleteSubscriptionWorkOrder = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'put',
    url: `/subscriptionWorkOrder/softDelete`,
    data,
  });

export const pricingUpdateStatusBySubscriptionsOrdersIds = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'post',
    url: `/subscriptionWorkOrder/updateBySubscriptionOrderId`,
    data,
  });

export const pricingUpdateSubscriptionWorkOrder = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'put',
    url: `/subscriptionWorkOrder/${data.id}`,
    data,
  });

export const pricingGetBySubscriptionWorkOrder = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'get',
    url: `/subscriptionWorkOrder/by`,
    data,
  });

export const pricingUpdateManySubscriptionWorkOrder = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'put',
    url: `/subscriptionWorkOrder/updateMany`,
    data,
  });

export const pricingSubscriptionWorkOrderCount = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'get',
    url: `/subscriptionWorkOrder/count`,
    data,
  });

export const pricingSubscriptionWorkOrderCountJoin = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'get',
    url: `/subscriptionWorkOrder/countJoin`,
    data,
  });

export const pricingSubscriptionWorkOrderCountStatus = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'get',
    url: `/subscriptionWorkOrder/countStatus`,
    data,
  });

export const pricingGetSubscriptionByStatus = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'get',
    url: `/subscriptionWorkOrder/subscriptionByStatus`,
    data,
  });
export const pricingGetSubscriptionsCount = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'get',
    url: `/subscriptions/count`,
    data,
  });

export const pricingUpdateStatuSubscriptionWorkOrders = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'put',
    url: `/subscriptionWorkOrder/update/status`,
    data,
  });

export const pricingUpsertSubscriptionWorkOrderMedia = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'put',
    url: `/subscriptionWorkOrderMedia/upsert`,
    data,
  });
export const pricingCreateFromUrlSubscriptionWorkOrderMedia = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'post',
    url: `/subscriptionWorkOrderMedia/createFromUrl`,
    data,
  });
export const pricingGetSubscriptionWorkOrderMedia = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'get',
    url: `/subscriptionWorkOrderMedia/${data.id}`,
  });

export const pricingUpsertSubscriptionOrderMedia = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'put',
    url: `/subscriptionOrderMedia/upsert`,
    data,
  });
export const pricingCreateFromUrlSubscriptionOrderMedia = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'post',
    url: `/subscriptionOrderMedia/createFromUrl`,
    data,
  });

export const pricingUpsertSubscriptionOrder = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'put',
    url: `/subscriptionOrders/upsert`,
    data,
  });

export const pricingGetSubscriptionOrdersCount = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'get',
    url: '/subscriptionOrders/count',
    data,
  });

export const pricingGetSubcriptionsCalculatePrices = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'post',
    url: `/subscriptions/calculate-prices`,
    data,
  });

export const pricingGetWOSequenceCount = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'get',
    url: `/subscriptionWorkOrder/sequenceCount`,
    data,
  });

export const pricingAddBulkSubscriptionWorkOrders = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'post',
    url: `/subscriptionWorkOrder/bulk`,
    data,
  });

export const pricingAlterSubscriptionsOrders = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'put',
    url: `/subscriptionOrders/${data.id}`,
    data,
  });

export const pricingDeleteSubscriptionsOrders = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'delete',
    url: `/subscriptionOrders/`,
    data,
  });

export const pricingGetSubscriptionOrder = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'get',
    url: `/subscriptionOrders/${data.id}`,
  });

export const pricingUpsertSubscriptionOrdersLineItems = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'post',
    url: `/subscriptionOrderLineItems/upsert`,
    data,
  });

export const pricingUpsertSubscriptionWorkOrdersLineItems = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'post',
    url: `/subscriptionWorkOrderLineItems/upsert`,
    data,
  });

export const pricingGetEndingSubscriptions = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'get',
    url: '/subscriptions/ending',
    data,
  });

export const pricingCloseEndingSubscriptions = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'post',
    url: '/subscriptions/ending/close',
    data,
  });
export const pricingGetBySubscription = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'get',
    url: `/subscriptions`,
    data,
  });

export const pricingGetSubscriptionForJob = ctx =>
  makePricingRequest(ctx, {
    method: 'get',
    url: `/subscriptions/AllWithoutEndDate`,
  });

export const pricingGetSubscriptionWorkOrdersBy = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'get',
    url: 'subscriptionWorkOrder/by',
    data,
  });

export const pricingGetNextServiceBySubscriptionId = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'get',
    url: `/subscriptionOrders/${data.id}/nextService`,
    data,
  });
export const pricingGetSubscriptionsServiceItems = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'get',
    url: '/subscriptions/service-items',
    data,
  });

export const pricingValidateSubscriptionOrder = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'patch',
    url: '/subscriptions/orders/validate',
    data,
  });

export const subscriptionServiceItemsBySpecificDate = (ctx, data) =>
  makePricingRequest(ctx, {
    method: 'get',
    url: `/subscriptionServiceItem/getItemBySpecificDate`,
    data,
  });

export const subscriptionNextServiceItemsBySpecificDate = (ctx, data) =>
  makePricingRequest(ctx, {
    method: 'get',
    url: `/subscriptionServiceItem/getNextItemBySpecificDate`,
    data,
  });

export const pricingAlterSubscriptionServiceItem = (ctx, { data }, id) =>
  makePricingRequest(ctx, {
    method: 'put',
    url: `/subscriptionServiceItem/${id}`,
    data,
  });

export const subscriptionLineItemsBySpecificDate = (ctx, data) =>
  makePricingRequest(ctx, {
    method: 'get',
    url: `/subscriptionLineItem/getItemBySpecificDate`,
    data,
  });

export const subscriptionNextLineItemsBySpecificDate = (ctx, data) =>
  makePricingRequest(ctx, {
    method: 'get',
    url: `/subscriptionLineItem/getNextItemBySpecificDate`,
    data,
  });

export const pricingAlterSubscriptionLineItem = (ctx, { data }, id) =>
  makePricingRequest(ctx, {
    method: 'put',
    url: `/subscriptionLineItem/${id}`,
    data,
  });

export const pricingDeleteSubscriptionLineItem = (ctx, { data }) =>
  makePricingRequest(ctx, {
    method: 'delete',
    url: `/subscriptionLineItem/`,
    data,
  });
