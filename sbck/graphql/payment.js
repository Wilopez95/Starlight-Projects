import gql from 'graphql-tag';

export const typeDefs = gql`
  type Payment {
    id: ID!

    originalPaymentId: ID

    status: PaymentStatus!
    invoicedStatus: PaymentInvoicedStatus
    date: String!
    paymentType: PaymentType!
    amount: Float!
    sendReceipt: Boolean!
    checkNumber: String
    isAch: Boolean!
    memoNote: String
    billableItemType: String
    billableItemId: ID
    writeOffNote: String
    deferredUntil: String

    prevBalance: Float!
    newBalance: Float
    appliedAmount: Float!
    unappliedAmount: Float
    paidOutAmount: Float!
    refundedAmount: Float!
    refundedOnAccountAmount: Float!

    receiptPreviewUrl: String
    receiptPdfUrl: String
    bankDepositDate: String

    customer: Customer!
    orders: [PaymentRelatedOrder!]!
    creditCard: CreditCard
    invoices: [AppliedInvoice!]!
    reverseData: ReverseData
    refundData: [RefundData]
    isEditable: Boolean!
    isPrepay: Boolean!
  }

  input PaymentFilters {
    filterByCreatedFrom: String
    filterByCreatedTo: String
    filterByInvoicedStatus: [PaymentInvoicedStatus!]
    filterByType: [PaymentType!]
    filterByAmountFrom: Float
    filterByAmountTo: Float
    filterByUnappliedFrom: Float
    filterByUnappliedTo: Float
    filterByUser: [ID!]
  }

  type ReverseData {
    id: ID!

    date: String!
    note: String
    type: String!
    amount: Float!
  }

  type RefundData {
    id: ID!

    type: RefundType!
    amount: Float!
  }

  input PaymentApplicationInput {
    invoiceId: ID!
    amount: Float!
  }

  type PaidOutPayment {
    id: ID!

    status: PaymentStatus!
    invoicedStatus: PaymentInvoicedStatus
    date: String!
    paymentType: PaymentType!
    amount: Float!
    sendReceipt: Boolean!
    checkNumber: String
    isAch: Boolean!

    prevBalance: Float!
    newBalance: Float
    appliedAmount: Float!
    unappliedAmount: Float
    paidOutAmount: Float!
    refundedAmount: Float!
    refundedOnAccountAmount: Float!
  }

  input ReverseDataInput {
    date: String!
    note: String
    type: String!
    amount: Float!
  }

  input UnappliedPaymentInput {
    paymentType: PaymentType!
    date: String
    amount: Float!

    creditCardId: ID
    newCreditCard: CreditCardInput

    checkNumber: String
    isAch: Boolean
    sendReceipt: Boolean

    memoNote: String
    billableItemType: String
    billableItemId: ID

    applications: [PaymentApplicationInput!]
  }

  input EditCreditMemoInput {
    memoNote: String
    billableItemType: String
    billableItemId: ID
    amount: Float!
    date: String!
  }

  input NewMultiOrderPayment {
    orderIds: [ID!]!

    creditCardId: ID
    newCreditCard: CreditCardInput

    paymentType: PaymentType!
    date: String
    checkNumber: String
    isAch: Boolean
    sendReceipt: Boolean

    deferredUntil: String
  }
`;

export const resolvers = {
  Payment: {
    date: obj => new Date(obj.date).toUTCString(),
    deferredUntil: obj => (obj.deferredUntil ? new Date(obj.deferredUntil).toUTCString() : null),
    bankDepositDate: obj =>
      obj.bankDepositDate ? new Date(obj.bankDepositDate).toUTCString() : null,
    originalPaymentId: obj => obj.$getOriginalPaymentId(),
    customer: obj => obj.$relatedQuery('customer'),
    reverseData: obj => obj.$relatedQuery('reverseData'),
    refundData: obj => obj.$relatedQuery('refundData'),
    orders: obj => obj.$relatedQuery('orders'),
    creditCard: obj => obj.$relatedQuery('creditCard'),
    invoices: obj => obj.$relatedQuery('invoices').orderBy('id', 'desc'),
    isEditable: obj => obj.$isEditable(),
  },
  PaidOutPayment: {
    date: obj => new Date(obj.date).toUTCString(),
  },
};
