import gql from 'graphql-tag';

export const typeDefs = gql`
  union InvoicedEntity = Order
  union InvoicedSubscriptionEntity = Subscription

  type Invoice {
    id: ID!
    dueDate: String
    createdAt: String!

    csrName: String!
    csrEmail: String!

    #from many to many table
    fine: Float

    total: Float!
    balance: Float!
    pdfUrl: String
    previewUrl: String

    type: InvoiceType!

    businessLines: [BusinessLine]

    invoicedEntity: [InvoicedEntity!]
    invoicedSubscriptionEntity: [InvoicedSubscriptionEntity!]

    customer: Customer!
    payments: [Payment!]!
    emails: [InvoiceEmail!]!
    writeOff: Boolean!
    businessUnit: BusinessUnit
    financeChargeId: Int
  }

  input InvoiceFilters {
    canWriteOff: Boolean
    filterByType: [InvoiceType!]
    filterByStatus: [InvoiceStatus!]
    filterByCustomer: [CustomerType!]
    filterByAge: [InvoiceAge!]
    filterByDueDateFrom: String
    filterByDueDateTo: String
    filterByCreatedFrom: String
    filterByCreatedTo: String
    filterByAmountFrom: Float
    filterByAmountTo: Float
    filterByBalanceFrom: Float
    filterByBalanceTo: Float
    filterByUser: [ID!]
    filterBusinessLineIds: [ID!]
  }

  type AppliedInvoice {
    id: ID!
    dueDate: String
    createdAt: String!

    total: Float!
    balance: Float!

    type: InvoiceType!

    pdfUrl: String
    previewUrl: String

    amount: Float!
    prevBalance: Float!
    writeOff: Boolean!
  }
`;

export const resolvers = {
  Invoice: {
    createdAt: obj => new Date(obj.createdAt).toUTCString(),
    dueDate: obj => (obj.dueDate ? new Date(obj.dueDate).toUTCString() : null),

    invoicedEntity: obj => obj.$relatedQuery('orders').orderBy('serviceDate').orderBy('id'),
    invoicedSubscriptionEntity: obj => obj.$getSubscriptions(obj.id),
    businessLines: obj => {
      return obj.$getLob();
    },
    payments: obj => obj.$relatedQuery('payments').orderBy('date').orderBy('id'),
    customer: obj => obj.$relatedQuery('customer'),
    emails: obj => obj.$relatedQuery('emails').orderBy('id'),
    businessUnit: obj => obj.$relatedQuery('businessUnit'),
  },

  InvoicedEntity: {
    __resolveType() {
      return 'Order';
    },
  },

  InvoicedSubscriptionEntity: {
    __resolveType() {
      return 'Subscription';
    },
  },

  AppliedInvoice: {
    createdAt: obj => new Date(obj.createdAt).toUTCString(),
    dueDate: obj => (obj.dueDate ? new Date(obj.dueDate).toUTCString() : null),
  },
};
