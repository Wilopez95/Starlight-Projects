import { BaseGraphqlService, billingHttpClient } from '../../../../api/base';
import { GraphqlVariables } from '../../../../api/base/types';
import { InvoicesByBuRequestBody } from '../../types';
import { type ISendInvoicesData } from '../components/SendInvoices/types';

import {
  DetailedInvoiceFragment,
  InvoiceCustomer,
  InvoicedOrderFragment,
  InvoicedSubscriptionFragment,
  InvoiceFragment,
} from './fragments';
import {
  AllInvoiceResponse,
  CustomerInvoicesResponse,
  InvoiceByIdResponse,
  InvoicedOrderResponse,
  InvoicedSubscriptionOrderResponse,
} from './types';

export class InvoiceService extends BaseGraphqlService {
  getByBu(variables: InvoicesByBuRequestBody) {
    return this.graphql<AllInvoiceResponse>(
      `
    query getAllInvoices($customerId: ID, $subscriptionId: ID,$businessUnitId: ID, $offset: Int, $limit: Int, $sortBy: InvoiceSorting, $sortOrder: SortOrder, $filters: InvoiceFilters, $query: String) {
      invoices(customerId: $customerId, subscriptionId: $subscriptionId, businessUnitId: $businessUnitId, offset: $offset, limit: $limit, sortBy: $sortBy, sortOrder: $sortOrder, filters: $filters, query: $query)
      {
        ${InvoiceFragment}
        customer {
          ${InvoiceCustomer}
        }
      }
      invoicesCount(businessUnitId: $businessUnitId, customerId: $customerId, subscriptionId: $subscriptionId, filters: $filters, query: $query)
    }`,
      variables,
    );
  }

  getByCustomer(
    variables: GraphqlVariables & {
      customerId: number;
      jobSiteId?: number;
    },
  ) {
    return this.graphql<CustomerInvoicesResponse>(
      `
      query getCustomerInvoices($customerId: ID, $offset: Int, $limit: Int, $sortBy: InvoiceSorting, $sortOrder: SortOrder, $jobSiteId: ID, $filters: InvoiceFilters, $query: String) {
          invoices(
            jobSiteId: $jobSiteId
            offset: $offset
            limit: $limit
            sortBy: $sortBy
            sortOrder: $sortOrder
            customerId: $customerId
            filters: $filters
            query: $query
          )
          {
            ${InvoiceFragment}
            customer {
              id
            }
          }
        }

    `,
      variables,
    );
  }

  getById(variables: GraphqlVariables & { id: number }) {
    return this.graphql<InvoiceByIdResponse>(
      `
      query getInvoiceById($id: ID!) {
        invoice(id: $id) {
          ${InvoiceFragment}
          customer {
            ${InvoiceCustomer}
          }
        }
      }
    `,
      variables,
    );
  }

  getDetailedById(variables: { id: number }) {
    return this.graphql<InvoiceByIdResponse>(
      `
      query getInvoiceById($id: ID!) {
        invoice(id: $id) {
          ${InvoiceFragment}
          ${DetailedInvoiceFragment}
            invoicedEntity {
    
              ... on Order {
                ${InvoicedOrderFragment}
              }
            }
            invoicedSubscriptionEntity {
    
              ... on Subscription {
                ${InvoicedSubscriptionFragment}
              }
            }
          customer {
            ${InvoiceCustomer}
          }
        }
      }
    `,
      variables,
    );
  }

  getDetailedByOrderId(variables: { orderId: number | string }) {
    return this.graphql<InvoicedOrderResponse>(
      `
      query getInvoiceByOrderId($orderId: ID!) {
        order(id: $orderId) {
          invoice {
            ${InvoiceFragment}
            ${DetailedInvoiceFragment}
            orders {
              ${InvoicedOrderFragment}
            }
          }
          customer {
            ${InvoiceCustomer}
          }
        }
      }
    `,
      variables,
    );
  }

  getDetailedBySubOrderId(variables: { orderId: string }) {
    return this.graphql<InvoicedSubscriptionOrderResponse>(
      `
      query getInvoiceBySubOrderId($orderId: ID!) {
        invoiceBySubOrderId(orderId: $orderId) {
          ${InvoiceFragment}
          customer {
            ${InvoiceCustomer}
          }
        }
      }
    `,
      variables,
    );
  }

  static sendInvoices({
    invoiceIds,
    customerEmails,
    attachMedia,
    sendToCustomerInvoiceEmails,
  }: ISendInvoicesData) {
    return billingHttpClient.graphql<number>(
      `
      mutation SendInvoices(
        $invoiceIds: [Int!]!
        $customerEmails: [String!]!
        $attachMedia: InvoiceMailing
        $sendToCustomerInvoiceEmails: Boolean
      ) {
        sendInvoices(
          invoiceIds: $invoiceIds, customerEmails: $customerEmails, attachMedia: $attachMedia, sendToCustomerInvoiceEmails: $sendToCustomerInvoiceEmails)
      }
      `,
      { invoiceIds, customerEmails, attachMedia, sendToCustomerInvoiceEmails },
    );
  }

  static async downloadInvoiceMediaFiles(id: number) {
    return billingHttpClient.get(`invoices/${id}/download-media`);
  }

  static async downloadInvoices(query: string) {
    return billingHttpClient.get(`invoices/combined?${query}`);
  }
}
