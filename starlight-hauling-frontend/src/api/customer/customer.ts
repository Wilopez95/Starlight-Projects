import { type CustomerStoreCountResponse, type ICustomer } from '@root/types';
import {
  type IBulkOnHoldRequest,
  type IBulkOnHoldResponse,
  type IBulkResumeRequest,
  type IBulkResumeResponse,
  type IChangeStatusRequest,
  type IResponseBalances,
  type IResponseCustomer,
} from '@root/types/responseEntities';

import { BaseService, billingHttpClient, haulingHttpClient, RequestQueryParams } from '../base';

export class CustomerService extends BaseService<
  ICustomer,
  IResponseCustomer,
  CustomerStoreCountResponse
> {
  constructor() {
    super('customers');
  }

  requestForInvoicing(query: { businessUnitId: string }) {
    return haulingHttpClient.get<Pick<ICustomer, 'id' | 'name' | 'status'>[]>(
      `${this.baseUrl}/invoicing`,
      query,
    );
  }

  requestForInvoicingSubscriptions(query: { businessUnitId: string }) {
    return haulingHttpClient.get<Pick<ICustomer, 'id' | 'name' | 'status'>[]>(
      `${this.baseUrl}/invoicing-subscriptions`,
      query,
    );
  }

  requestByJobSite({
    jobSiteId,
    businessUnitId,
    limit,
    skip,
  }: { jobSiteId: number; businessUnitId: string } & RequestQueryParams) {
    return haulingHttpClient.get<IResponseCustomer[]>(`job-sites/${jobSiteId}/customers`, {
      businessUnitId,
      skip,
      limit,
    });
  }

  static getBalances(customerId: number) {
    return billingHttpClient.graphql<IResponseBalances>(
      `
      query getCustomerBalances($customerId: ID!) {
        customerBalances(customerId: $customerId) {
          availableCredit
          balance
          creditLimit
          nonInvoicedTotal
          prepaidOnAccount
          prepaidDeposits
          paymentDue
        }
      }
      `,
      { customerId },
    );
  }

  checkDuplicate(data: Partial<ICustomer>) {
    return haulingHttpClient.post<Partial<IResponseCustomer>>(
      `${this.baseUrl}/search/customer-duplicates`,
      data,
    );
  }

  changeStatus(customerData: IChangeStatusRequest) {
    const { id, ...data } = customerData;

    return haulingHttpClient.patch<IChangeStatusRequest, IResponseCustomer>({
      url: `${this.baseUrl}/${id}/status`,
      data,
    });
  }

  bulkPutOnHold(data: IBulkOnHoldRequest) {
    return haulingHttpClient.patch<IBulkOnHoldRequest, Array<IBulkOnHoldResponse>>({
      url: `${this.baseUrl}/bulk-on-hold`,
      data,
    });
  }

  bulkResume(data: IBulkResumeRequest) {
    return haulingHttpClient.patch<IBulkResumeRequest, Array<IBulkResumeResponse>>({
      url: `${this.baseUrl}/bulk-resume`,
      data,
    });
  }
}
