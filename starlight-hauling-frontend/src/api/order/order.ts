import { type ICancelOrderData } from '@root/components/forms/CancelOrder/types';
import { IRescheduleOrderData } from '@root/components/forms/RescheduleOrder/types';
import { type IRevertOrderStatusData } from '@root/components/forms/RevertOrderStatus/types';
import { GenerateInvoicesRequest } from '@root/modules/billing/types';
import {
  IMapCompletedOrder,
  type IApproveOrFinalizeMultipleRequest,
  type IBusinessContextIds,
  type IConfigurableOrder,
  type IOrder,
  type IValidateMultipleOrdersRequest,
  type IWorkOrderMediaFile,
  type OrderHistory,
} from '@root/types';
import { OrderStoreCountResponse } from '@root/types/counts';

import {
  BaseService,
  billingHttpClient,
  haulingHttpClient,
  pricingHttpClient,
  RequestQueryParams,
} from '../base';

import {
  type ICommonInvoicingRequest,
  type IDroppedEquipmentItem,
  type IOrderInvoicingRequest,
  type IOrderRatesCalculateRequest,
  type IOrderRatesCalculateResponse,
  type IOrderSelectCustomRatesResponse,
  type IOrderSelectGlobalRatesResponse,
  type IOrderSelectRatesRequest,
  type ISaveInvoicesResponse,
  type RunInvoicingResponse,
  RunCommonInvoicingResponse,
} from './types';

const baseUrl = 'orders';
const ratesBaseUrl = 'rates';

export class OrderService extends BaseService<IOrder, IOrder, OrderStoreCountResponse> {
  constructor() {
    super(baseUrl);
  }

  editOrder(id: number, data: IConfigurableOrder) {
    const concurrentData = { [id]: data.updatedAt };

    return pricingHttpClient.put<IConfigurableOrder, { orderIds: number[] }>({
      url: `${this.baseUrl}/${id}`,
      data,
      concurrentData,
    });
  }

  requestMediaFiles(id: number, workOrderId: number) {
    return haulingHttpClient.get<IWorkOrderMediaFile[]>(
      `${this.baseUrl}/${id}/media-files/${workOrderId}`,
    );
  }

  createOrder(newEntity: Partial<IOrder>) {
    return haulingHttpClient.sendForm({
      data: newEntity,
      url: this.baseUrl,
    });
  }

  reschedule(
    id: number,
    data: Omit<IRescheduleOrderData, 'serviceDate'> & { serviceDate: string },
  ) {
    return haulingHttpClient.put({ url: `${this.baseUrl}/${id}/reschedule`, data });
  }

  cancel(id: number, data: ICancelOrderData) {
    return haulingHttpClient.post(`${this.baseUrl}/${id}/cancel`, data);
  }

  unapprove(id: number, data: IRevertOrderStatusData) {
    return pricingHttpClient.post(`${this.baseUrl}/${id}/unapprove`, data);
  }

  unfinalize(id: number, data: IRevertOrderStatusData) {
    return pricingHttpClient.post(`${this.baseUrl}/${id}/unfinalize`, data);
  }

  getViewDetails(id: number) {
    return haulingHttpClient.get<IOrder>(`${this.baseUrl}/${id}/details`);
  }

  syncWithDispatch(id: number) {
    return haulingHttpClient.patch<null, IOrder>({
      url: `${this.baseUrl}/${id}/dispatch-sync`,
      data: null,
    });
  }

  completeOrder(id: number, completedOrder: IMapCompletedOrder) {
    const concurrentData = { [id]: completedOrder.updatedAt };

    return haulingHttpClient.sendForm({
      url: `${this.baseUrl}/${id}/complete`,
      data: completedOrder as unknown as Record<string, unknown>,
      method: 'POST',
      concurrentData,
    });
  }

  approveOrder(id: number, approvedOrder: IMapCompletedOrder) {
    return pricingHttpClient.post(`${this.baseUrl}/${id}/approve`, approvedOrder);
  }

  finalizeOrder(id: number, finalizeOrder: IMapCompletedOrder) {
    return pricingHttpClient.post(`${this.baseUrl}/${id}/finalize`, finalizeOrder);
  }

  // eslint-disable-next-line class-methods-use-this
  requestOpenOrders(customerId: number, options: RequestQueryParams) {
    return haulingHttpClient.get<IOrder[]>(`customers/${customerId}/profile/open-orders`, options);
  }

  // eslint-disable-next-line class-methods-use-this
  requestInvoicedOrders(customerId: number, options: RequestQueryParams) {
    return haulingHttpClient.get<IOrder[]>(
      `customers/${customerId}/profile/invoiced-orders`,
      options,
    );
  }

  // eslint-disable-next-line class-methods-use-this
  requestGeneratedOrders(recurrentOrderId: number, options: RequestQueryParams) {
    return pricingHttpClient.get<IOrder[]>(`recurrent-orders/${recurrentOrderId}/orders`, options);
  }

  approveMultipleOrders(request: IApproveOrFinalizeMultipleRequest) {
    return pricingHttpClient.post(
      `${this.baseUrl}/approve?businessUnitId=${request.businessUnitId}`,
      request,
    );
  }

  finalizeMultipleOrders(request: IApproveOrFinalizeMultipleRequest) {
    return pricingHttpClient.post(
      `${this.baseUrl}/finalize?businessUnitId=${request.businessUnitId}`,
      request,
    );
  }

  unapproveMultipleOrders(ids: number[], businessUnitId: string) {
    return haulingHttpClient.post(`${this.baseUrl}/unapprove`, { ids, businessUnitId });
  }

  validateOrdersToApprove(request: IValidateMultipleOrdersRequest, businessUnitId: string) {
    return haulingHttpClient.post<IValidateMultipleOrdersRequest, { total: number }>(
      `${this.baseUrl}/approve/validate?businessUnitId=${businessUnitId}`,
      request,
    );
  }

  validateOrdersToFinalize(request: IValidateMultipleOrdersRequest, businessUnitId: string) {
    return haulingHttpClient.post<IValidateMultipleOrdersRequest, { total: number }>(
      `${this.baseUrl}/finalize/validate?businessUnitId=${businessUnitId}`,
      request,
    );
  }

  refundWrongCC(id: number, data: unknown & { businessUnitId: string }) {
    return haulingHttpClient.post(`${this.baseUrl}/${id}/refund-wrong-cc`, data);
  }

  history(orderId: number) {
    return haulingHttpClient.get<OrderHistory>(`${this.baseUrl}/${orderId}/history`);
  }

  static selectRatesGroup({
    businessUnitId,
    businessLineId,
    customerId,
    customerJobSiteId,
    date,
    serviceAreaId,
  }: {
    customerId: number;
    customerJobSiteId: number | null;
    date: Date;
    serviceAreaId?: number;
  } & IBusinessContextIds) {
    return haulingHttpClient.post<
      IOrderSelectRatesRequest,
      IOrderSelectCustomRatesResponse | IOrderSelectGlobalRatesResponse
    >(`${ratesBaseUrl}/select`, {
      businessUnitId: +businessUnitId,
      businessLineId: +businessLineId,
      customerId,
      customerJobSiteId,
      serviceDate: date,
      serviceAreaId,
    });
  }

  static selectRatesGroupRecurrentOrder({
    businessUnitId,
    businessLineId,
    customerId,
    customerJobSiteId,
    date,
    serviceAreaId,
    customRateGroupId,
  }: {
    customerId: number;
    customerJobSiteId: number | null;
    date: Date;
    serviceAreaId?: number;
    customRateGroupId?: number;
  } & IBusinessContextIds) {
    return haulingHttpClient.post<
      IOrderSelectRatesRequest,
      IOrderSelectCustomRatesResponse | IOrderSelectGlobalRatesResponse
    >(`${ratesBaseUrl}/selectRecurrent`, {
      businessUnitId: +businessUnitId,
      businessLineId: +businessLineId,
      customerId,
      customerJobSiteId,
      serviceDate: date,
      serviceAreaId,
      customRateGroupId,
    });
  }

  static calculateRates(data: IOrderRatesCalculateRequest) {
    return haulingHttpClient.post<IOrderRatesCalculateRequest, IOrderRatesCalculateResponse>(
      `${ratesBaseUrl}/calc`,
      data,
    );
  }

  static getHistoricalRates(options: RequestQueryParams) {
    return haulingHttpClient.get<IOrder[]>(`rates/history`, options);
  }

  static countInvoicingOrders(data: IOrderInvoicingRequest, query: { businessUnitId: string }) {
    return pricingHttpClient.post<IOrderInvoicingRequest, { total: number }>(
      `${baseUrl}/invoicing/count`,
      data,
      query,
    );
  }

  static countInvoicingSubscriptionOrders(data: ICommonInvoicingRequest, businessUnitId: string) {
    return pricingHttpClient.post<
      IOrderInvoicingRequest,
      { subscriptionsCount: number; ordersCount: number }
    >(`${baseUrl}/invoicing/count/subscriptions-orders?businessUnitId=${businessUnitId}`, data);
  }

  static runOrdersInvoicing(data: IOrderInvoicingRequest, query: { businessUnitId: string }) {
    return pricingHttpClient.post<IOrderInvoicingRequest, RunInvoicingResponse>(
      `${baseUrl}/invoicing/run`,
      data,
      query,
    );
  }

  static runOrdersAndSubscriptionsInvoicing(
    data: ICommonInvoicingRequest,
    query: { businessUnitId: string },
  ) {
    return pricingHttpClient.post<ICommonInvoicingRequest, RunCommonInvoicingResponse>(
      `${baseUrl}/invoicing/orders-subscriptions/run`,
      data,
      query,
    );
  }

  static saveOrderInvoices(data: GenerateInvoicesRequest) {
    return haulingHttpClient.post<GenerateInvoicesRequest, ISaveInvoicesResponse>(
      `${baseUrl}/invoicing/generate`,
      data,
    );
  }

  static saveCommonInvoices(data: GenerateInvoicesRequest) {
    return haulingHttpClient.post<GenerateInvoicesRequest, ISaveInvoicesResponse>(
      `${baseUrl}/invoicing/orders-subscriptions/generate`,
      data,
    );
  }

  static deleteMediaFile(
    woNumber: number,
    query: { deleteFromDispatch: boolean; mediaId: number; isRollOff: boolean },
  ) {
    return haulingHttpClient.delete(`${baseUrl}/media/${woNumber}`, query);
  }

  static getDroppedEquipmentItems({
    customerId,
    jobSiteId,
    equipmentItemSize,
    businessUnitId,
    businessLineId,
  }: {
    customerId: number;
    jobSiteId: number;
    equipmentItemSize: string;
    businessUnitId: string;
    businessLineId: string;
  }) {
    return haulingHttpClient.get<IDroppedEquipmentItem[]>(`${baseUrl}/dropped-cans`, {
      customerId,
      jobSiteId,
      equipmentItemSize,
      businessUnitId,
      businessLineId,
    });
  }

  static putOrdersOnAccount(orderIds: number[], overrideCreditLimit: boolean) {
    return billingHttpClient.graphql<boolean>(
      `
      mutation OrdersPutOnAccount(
        $orderIds: [Int!]!
        $overrideCreditLimit: Boolean
      ) {
        ordersPutOnAccount(orderIds: $orderIds, overrideCreditLimit: $overrideCreditLimit)
      }
      `,
      {
        orderIds,
        overrideCreditLimit,
      },
    );
  }
}
