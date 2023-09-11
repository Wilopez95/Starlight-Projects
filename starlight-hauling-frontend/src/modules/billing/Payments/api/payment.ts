import { format } from 'date-fns';
import { omit } from 'lodash-es';

import { dateFormatsEnUS } from '@root/i18n/format/date';

import {
  BaseGraphqlService,
  billingHttpClient,
  GraphqlVariables,
  PaymentTypeEnum,
} from '../../../../api/base';
import { type AppliedFilterState } from '../../../../common/TableTools/TableFilter';
import { sanitizeCreditCard } from '../../CreditCards/store/sanitize';
import {
  type NewMultiOrderPayment,
  type NewUnappliedPaymentPayload,
  type PaymentApplication,
  type RefundPrepaidOrderPayment,
  type ReverseData,
  type ValidateMerchantData,
} from '../types';

import {
  DeferredPaymentFragment,
  DetailedPaymentFragment,
  PaymentFragment,
  PaymentGridFragment,
} from './fragments';
import {
  type CustomerApplyPaymentResponse,
  type CustomerDeferredPaymentsResponse,
  type CustomerDeletedCreditMemoResponse,
  type CustomerEditedCreditMemoResponse,
  type CustomerMultiOrderPaymentResponse,
  type CustomerPaymentResponse,
  type CustomerPaymentsResponse,
  type CustomerRefundPaymentResponse,
  type CustomerReversePaymentResponse,
  type CustomerUnappliedPaymentResponse,
  type LatestOrderPayment,
  type UnconfirmedPaymentsResponse,
} from './response';

const castUnappliedPaymentToSend = (data: NewUnappliedPaymentPayload) =>
  omit(
    {
      ...data,
      paymentType: PaymentTypeEnum[data.paymentType],
      amount: Number(data.amount),
    },
    [
      'invoicedStatus',
      'prevBalance',
      'newBalance',
      'appliedAmount',
      'unappliedAmount',
      'invoices',
      'writeOffNote',
      'refundedAmount',
      'refundedOnAccountAmount',
    ],
  );

const castCreditMemoToSend = (data: NewUnappliedPaymentPayload) =>
  omit(
    {
      ...data,
      paymentType: PaymentTypeEnum[data.paymentType],
      amount: Number(data.amount),
    },
    [
      'invoicedStatus',
      'prevBalance',
      'newBalance',
      'appliedAmount',
      'unappliedAmount',
      'invoices',
      'writeOffNote',
      'refundedAmount',
      'refundedOnAccountAmount',

      'businessUnitId',
      'isAch',
      'paymentType',
      'sendReceipt',
      'applications',
      'checkNumber',
      '',
    ],
  );

export class PaymentService extends BaseGraphqlService {
  getPayments(
    variables: GraphqlVariables & {
      customerId?: number;
      businessUnitId?: number;
      filters?: AppliedFilterState;
    },
  ) {
    return this.graphql<CustomerPaymentsResponse>(
      `
      query getPayments($offset: Int, $limit: Int, $customerId: ID, $businessUnitId: ID, $sortBy: PaymentSorting, $sortOrder: SortOrder, $filters: PaymentFilters, $query: String) {
          payments(offset: $offset, limit: $limit, sortBy: $sortBy, sortOrder: $sortOrder, customerId: $customerId, businessUnitId: $businessUnitId, filters: $filters, query: $query) {
            ${PaymentGridFragment}
          }
      }
    `,
      variables,
    );
  }

  getDeferred(
    variables: GraphqlVariables & {
      failedOnly?: boolean;
    },
  ) {
    return this.graphql<CustomerDeferredPaymentsResponse>(
      `
      query getDeferredPayments($offset: Int, $limit: Int, $businessUnitId: ID, $failedOnly: Boolean, $sortBy: DeferredPaymentSorting, $sortOrder: SortOrder) {
          deferredPayments(offset: $offset, limit: $limit, sortBy: $sortBy, sortOrder: $sortOrder, businessUnitId: $businessUnitId, failedOnly: $failedOnly) {
            ${DeferredPaymentFragment}
          }
      }
    `,
      variables,
    );
  }

  static getUnconfirmed(variables: GraphqlVariables & { settlementId: number }) {
    return billingHttpClient.graphql<UnconfirmedPaymentsResponse>(
      `
      query getUnconfirmedPayments($settlementId: ID!) {
          unconfirmedPayments(settlementId: $settlementId) {
            ${PaymentFragment}
          }
      }
    `,
      variables,
    );
  }

  chargeDeferredById(variables: GraphqlVariables & { paymentId: number }) {
    return this.graphql<CustomerPaymentsResponse>(
      `
      mutation ChargeDeferred($paymentId: ID!) {
        chargeDeferredPayment(paymentId: $paymentId) {
            ${DeferredPaymentFragment}
          }
      }
    `,
      variables,
    );
  }

  chargeDeferredPayments(
    variables: GraphqlVariables & {
      paymentIds: number[];
    },
  ) {
    return this.graphql<CustomerDeferredPaymentsResponse>(
      `
      mutation ChargeDeferredPayments($paymentIds: [ID!]!) {
        chargeDeferredPayments(paymentIds: $paymentIds) {
            ${DeferredPaymentFragment}
          }
      }
    `,
      variables,
    );
  }

  writeOffInvoices(
    variables: GraphqlVariables & {
      invoiceIds: number[];
      customerId: number;
      note: string;
      date: string;
    },
  ) {
    return this.graphql<CustomerDeferredPaymentsResponse>(
      `
      mutation WriteOffInvoiced($invoiceIds: [ID!]!, $customerId: ID!, $note: String!) {
        writeOffInvoices(invoiceIds: $invoiceIds, customerId: $customerId, note: $note) {
          ${DetailedPaymentFragment}
        }
      }
    `,
      variables,
    );
  }

  getDetailedById(id: number) {
    return this.graphql<CustomerPaymentResponse>(
      `
      query getCustomerDetailedPayment($id: ID!) {
          payment(id: $id) {
            ${DetailedPaymentFragment}
          }
      }
    `,
      {
        id,
      },
    );
  }

  getLatestOrderPayment(orderId: number) {
    return this.graphql<LatestOrderPayment>(
      `
      query getLatestOrderPayment($orderId: ID!) {
        prepaidPayment(orderId: $orderId) {
            ${DetailedPaymentFragment}
          }
      }
    `,
      {
        orderId,
      },
    );
  }

  reversePayment(paymentId: number, reverseData: ReverseData) {
    return this.graphql<CustomerReversePaymentResponse>(
      `
      mutation ReversePayment(
        $paymentId: ID!
        $reverseData: ReverseDataInput!
      ) {
        reversePayment(paymentId: $paymentId, reverseData: $reverseData) {
          ${DetailedPaymentFragment}
        }
      }
      `,
      {
        paymentId,
        reverseData,
      },
    );
  }

  refundUnappliedPayment(paymentId: number, amount: number) {
    return this.graphql<CustomerRefundPaymentResponse>(
      `
      mutation RefundUnappliedPayment(
        $paymentId: ID!
        $amount: Float!
      ) {
        refundUnappliedPayment(paymentId: $paymentId, amount: $amount) {
          ${DetailedPaymentFragment}
        }
      }
      `,
      {
        paymentId,
        amount,
      },
    );
  }

  applyPaymentManually(paymentId: number, applications: PaymentApplication[]) {
    return this.graphql<CustomerApplyPaymentResponse>(
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
  }

  async createUnappliedPayment(customerId: number, data: NewUnappliedPaymentPayload) {
    const result = await this.graphql<CustomerUnappliedPaymentResponse>(
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
        data: castUnappliedPaymentToSend(data),
      },
    );

    return result.createUnappliedPayment;
  }

  async editCreditMemoPayment(id: number, data: NewUnappliedPaymentPayload) {
    const result = await this.graphql<CustomerEditedCreditMemoResponse>(
      `
      mutation EditCreditMemo(
        $id: ID!
        $data: EditCreditMemoInput!
      ) {
        editCreditMemo(id: $id, data: $data) {
          ${DetailedPaymentFragment}
        }
      }
      `,
      {
        id,
        data: castCreditMemoToSend(data),
      },
    );

    return result.editCreditMemo;
  }

  async deleteCreditMemoPayment(id: number) {
    const result = await this.graphql<CustomerDeletedCreditMemoResponse>(
      `
      mutation DeleteCreditMemo($id: ID!) {
        deleteCreditMemo(id: $id)
      }
      `,
      {
        id,
      },
    );

    return result?.deleteCreditMemo;
  }

  static refundPrepaidOrder({
    amount,
    orderId,
    refundType,
    checkNumber,
    refundedPaymentId,
  }: RefundPrepaidOrderPayment) {
    return billingHttpClient.graphql<number>(
      `
      mutation RefundPrepaidOrder(
        $orderId: ID!
        $amount: Float!
        $refundType: RefundType!
        $refundedPaymentId: ID!
        $checkNumber: String
      ) {
        refundPrepaidOrder(
          orderId: $orderId,
          amount: $amount,
          refundType:  $refundType,
          checkNumber:  $checkNumber,
          refundedPaymentId: $refundedPaymentId)
      }
      `,
      { amount, orderId, refundType, checkNumber, refundedPaymentId },
    );
  }

  static async createMultiOrderPayment(customerId: number, data: NewMultiOrderPayment) {
    const result = await billingHttpClient.graphql<CustomerMultiOrderPaymentResponse>(
      `
      mutation MultiOrderPayment(
        $customerId: ID!
        $data: NewMultiOrderPayment!
      ) {
        newMultiOrderPayment(customerId: $customerId, data: $data) {
          ${DetailedPaymentFragment}
        }
      }
      `,
      {
        customerId,
        data: {
          ...data,
          newCreditCard: data?.newCreditCard ? sanitizeCreditCard(data?.newCreditCard) : undefined,
          creditCardId:
            !data?.creditCardId || String(data?.creditCardId) === '0'
              ? undefined
              : data.creditCardId,
          paymentType: PaymentTypeEnum[data.paymentType],
          date: format(data.date, dateFormatsEnUS.ISO),
        },
      },
    );

    return result.newMultiOrderPayment;
  }

  static async validateMerchant(data: ValidateMerchantData) {
    return billingHttpClient.post('payments/validate-creds', data);
  }
}
