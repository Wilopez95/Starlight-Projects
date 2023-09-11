import { GraphqlVariables } from '@root/core/api/base';
import { AppliedFilterState } from '@root/core/common/TableTools/TableFilter';
import { billingHttpClient } from '@root/finance/api/httpClient';
import { CustomerInvoicesResponse, InvoiceByIdResponse } from '@root/finance/api/invoice/types';
import {
  DetailedInvoiceFragment,
  InvoiceCustomer,
  InvoicedOrderFragment,
  InvoicedSubscriptionFragment,
  InvoiceFragment,
} from '@root/finance/graphql/fragments';

export const getById = (variables: GraphqlVariables & { id: number }) =>
  billingHttpClient.graphql<InvoiceByIdResponse>(
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

export const getDetailedById = (variables: GraphqlVariables & { id: number }) =>
  billingHttpClient.graphql<InvoiceByIdResponse>(
    `
      query getInvoiceById($id: ID!) {
        invoice(id: $id) {
          ${InvoiceFragment}
          ${DetailedInvoiceFragment}

            invoicedEntity {
              ... on Subscription {
                ${InvoicedSubscriptionFragment}
              }
              ... on Order {
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

export const getByCustomer = (
  variables: GraphqlVariables & {
    customerId: number;
    jobSiteId?: number;
    filters?: AppliedFilterState;
    query?: string;
  },
) =>
  billingHttpClient.graphql<CustomerInvoicesResponse>(
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
          invoicesCount(customerId: $customerId, filters: $filters, query: $query)
        }

    `,
    variables,
  );
