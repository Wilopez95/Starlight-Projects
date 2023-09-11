import { ICancelOrderData } from '@root/components/forms/CancelOrder/types';
import { IRevertOrderStatusData } from '@root/components/forms/RevertOrderStatus/types';
import { ISubscriptionOrderCounts } from '@root/stores/subscriptionOrder/types';
import {
  IApproveOrFinalizeMultipleSubscriptionOrdersRequest,
  IConfigurableSubscriptionOrder,
  IRevertCompletedStatus,
  ISubscriptionOrder,
  ISubscriptionOrderCalculatePricePayload,
  ISubscriptionOrderCalculatePriceResponse,
  ITransitionSubscriptionOrderStatus,
  IValidateMultipleSubscriptionOrdersRequest,
} from '@root/types';

import { haulingHttpClient, RequestQueryParams, pricingHttpClient } from '../base';

export class SubscriptionOrderService {
  baseUrl = 'subscriptions/orders';

  getBaseUrlForSubscription({ subscriptionId }: { subscriptionId: number }) {
    return `subscriptions/${subscriptionId}/orders`;
  }

  get(options: RequestQueryParams = {}) {
    return pricingHttpClient.get<ISubscriptionOrder[]>(this.baseUrl, options);
  }

  getById(id: number, options: RequestQueryParams = {}) {
    return pricingHttpClient.get<ISubscriptionOrder>(`${this.baseUrl}/${id}`, options);
  }

  getBySubscriptionId(subscriptionId: number, options: RequestQueryParams = {}) {
    return pricingHttpClient.get<ISubscriptionOrder[]>(
      `subscriptionOrders/${subscriptionId}/orders/`,
      options,
    );
  }

  create(order: IConfigurableSubscriptionOrder, subscriptionId: number) {
    return haulingHttpClient.post<IConfigurableSubscriptionOrder>(
      this.getBaseUrlForSubscription({ subscriptionId }),
      order,
    );
  }

  update(order: IConfigurableSubscriptionOrder) {
    return haulingHttpClient.put<IConfigurableSubscriptionOrder>({
      url: `${this.baseUrl}/${order.id}`,
      data: order,
    });
  }

  complete(id: number, subscriptionOrder: ITransitionSubscriptionOrderStatus) {
    return haulingHttpClient.sendForm<ITransitionSubscriptionOrderStatus, ISubscriptionOrder>({
      url: `${this.baseUrl}/${id}/complete`,
      data: subscriptionOrder,
      method: 'POST',
    });
  }

  uncomplete(id: number, data: IRevertCompletedStatus) {
    return haulingHttpClient.post<IRevertCompletedStatus, ISubscriptionOrder>(
      `${this.baseUrl}/${id}/uncomplete`,
      data,
    );
  }

  approve(id: number, subscriptionOrder: ITransitionSubscriptionOrderStatus) {
    return haulingHttpClient.sendForm<ITransitionSubscriptionOrderStatus, ISubscriptionOrder>({
      url: `${this.baseUrl}/${id}/approve`,
      data: subscriptionOrder,
      method: 'POST',
    });
  }

  unapprove(id: number, data: IRevertOrderStatusData) {
    return haulingHttpClient.post<IRevertOrderStatusData, ISubscriptionOrder>(
      `${this.baseUrl}/${id}/unapprove`,
      data,
    );
  }

  finalize(id: number, subscriptionOrder: ITransitionSubscriptionOrderStatus) {
    return haulingHttpClient.sendForm<ITransitionSubscriptionOrderStatus, ISubscriptionOrder>({
      url: `${this.baseUrl}/${id}/finalize`,
      data: subscriptionOrder,
      method: 'POST',
    });
  }

  unfinalize(id: number, data: IRevertOrderStatusData) {
    return haulingHttpClient.post<IRevertOrderStatusData, ISubscriptionOrder>(
      `${this.baseUrl}/${id}/unfinalize`,
      data,
    );
  }

  cancel(id: number, data: ICancelOrderData) {
    return haulingHttpClient.post<ICancelOrderData, ISubscriptionOrder>(
      `${this.baseUrl}/${id}/cancel`,
      data,
    );
  }

  getCount(options: { businessUnitId: string }) {
    return pricingHttpClient.get<ISubscriptionOrderCounts>(`${this.baseUrl}/count/`, options);
  }

  calculatePrices(payload: ISubscriptionOrderCalculatePricePayload, abortSignal?: AbortSignal) {
    return haulingHttpClient.post<
      ISubscriptionOrderCalculatePricePayload,
      ISubscriptionOrderCalculatePriceResponse
    >(`${this.baseUrl}/calculate-prices`, payload, undefined, abortSignal);
  }

  approveOrFinalizeMultipleSubscriptionOrders(
    request: IApproveOrFinalizeMultipleSubscriptionOrdersRequest,
  ) {
    return haulingHttpClient.patch<IApproveOrFinalizeMultipleSubscriptionOrdersRequest>({
      url: `${this.baseUrl}/batch`,
      data: request,
    });
  }

  validateSubscriptionOrdersToApproveOrFinalize(
    request: IValidateMultipleSubscriptionOrdersRequest,
  ) {
    return pricingHttpClient.patch<
      IValidateMultipleSubscriptionOrdersRequest,
      { invalidOrdersTotal: number }
    >({
      url: `${this.baseUrl}/validate`,
      data: request,
    });
  }
}
