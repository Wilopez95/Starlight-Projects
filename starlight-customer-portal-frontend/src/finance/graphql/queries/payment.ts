import { Omit } from 'react-router';

import { GraphqlVariables } from '@root/core/api/base';
import { AppliedFilterState } from '@root/core/common/TableTools/TableFilter';
import { billingHttpClient } from '@root/finance/api/httpClient';
import {
  CustomerApplyPaymentResponse,
  CustomerPaymentsResponse,
  CustomerUnappliedPaymentResponse,
} from '@root/finance/api/payment/response';
import { DetailedPaymentFragment, PaymentFragment } from '@root/finance/graphql/fragments';
import { NewUnappliedPayment, PaymentApplication } from '@root/finance/types/entities';

export const getPayments = (
  variables: GraphqlVariables & {
    customerId?: number;
    businessUnitId?: number;
    filters?: AppliedFilterState;
  },
) =>
  billingHttpClient.graphql<CustomerPaymentsResponse>(
    `
      query getPayments($offset: Int, $limit: Int, $customerId: ID, $businessUnitId: ID, $sortBy: PaymentSorting, $sortOrder: SortOrder, $filters: PaymentFilters, $query: String) {
          payments(offset: $offset, limit: $limit, sortBy: $sortBy, sortOrder: $sortOrder, customerId: $customerId, businessUnitId: $businessUnitId, filters: $filters, query: $query) {
            ${PaymentFragment}
          }
      }
    `,
    variables,
  );

export const createUnappliedPayment = (
  customerId: number,
  data: Omit<
    NewUnappliedPayment,
    | 'invoicedStatus'
    | 'prevBalance'
    | 'newBalance'
    | 'appliedAmount'
    | 'unappliedAmount'
    | 'invoices'
    | 'writeOffNote'
    | 'refundedAmount'
    | 'refundedOnAccountAmount'
    | 'paymentType'
  >,
) =>
  billingHttpClient.graphql<CustomerUnappliedPaymentResponse>(
    `
    mutation UnappliedPayment(
      $customerId: ID!
      $data: UnappliedPaymentInput!
    ) {
      createUnappliedPayment(customerId: $customerId, data: $data) {
        ${DetailedPaymentFragment}
      }
    }
    `,
    {
      customerId,
      data,
    },
  );

export const applyPaymentManually = (paymentId: number, applications: PaymentApplication[]) =>
  billingHttpClient.graphql<CustomerApplyPaymentResponse>(
    `
    mutation ApplyPaymentManually(
      $paymentId: ID!
      $applications: [PaymentApplicationInput!]!
    ) {
      applyPayment(paymentId: $paymentId, applications: $applications) {
        ${DetailedPaymentFragment}
      }
    }
    `,
    {
      paymentId,
      applications,
    },
  );
