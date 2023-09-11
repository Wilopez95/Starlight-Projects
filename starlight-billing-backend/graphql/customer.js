import gql from 'graphql-tag';

import { parseDateRange } from '../utils/graphqlHelpers.js';

export const typeDefs = gql`
  type Customer {
    id: ID!

    businessUnitId: ID!
    businessName: String
    firstName: String
    lastName: String
    name: String!
    status: String!

    invoiceConstruction: InvoiceConstruction!
    onAccount: Boolean!
    creditLimit: Float
    billingCycle: BillingCycle
    paymentTerms: PaymentTerms
    addFinanceCharges: Boolean!
    aprType: AprType
    financeCharge: Float
    balance: Float!

    mailingAddress: Address!
    billingAddress: Address!

    cardConnectId: ID
    fluidPayId: ID

    sendInvoicesByPost: Boolean!
    sendInvoicesByEmail: Boolean!
    attachMediaPref: Boolean!
    attachTicketPref: Boolean!
    invoiceEmails: [String!]
    statementEmails: [String!]
    notificationEmails: [String!]

    creditCards(offset: Int = 0, limit: Int = 25): [CreditCard]!
    invoices(
      jobSiteId: ID
      offset: Int = 0
      limit: Int = 25
      from: String
      to: String
      sortBy: InvoiceSorting = ID
      sortOrder: SortOrder = ASC
    ): [Invoice]!
    invoicesCount: Int!
    payments(offset: Int = 0, limit: Int = 25): [Payment]!
  }

  type NonInvoicedOrdersTotals {
    prepaidTotal: Float!
    prepaidOnAccount: Float!
    total: Float!
  }

  type Balances {
    availableCredit: Float!
    balance: Float!
    creditLimit: Float!
    nonInvoicedTotal: Float!
    prepaidOnAccount: Float!
    prepaidDeposits: Float!
    paymentDue: Float!
  }

  type CustomerLastStatementBalance {
    id: ID!
    statementBalance: Float
  }
`;

export const resolvers = {
  Customer: {
    mailingAddress: obj => ({
      addressLine1: obj.mailingAddressLine1,
      addressLine2: obj.mailingAddressLine2,
      zip: obj.mailingZip,
      city: obj.mailingCity,
      state: obj.mailingState,
    }),
    billingAddress: obj => ({
      addressLine1: obj.billingAddressLine1,
      addressLine2: obj.billingAddressLine2,
      zip: obj.billingZip,
      city: obj.billingCity,
      state: obj.billingState,
    }),
    creditCards: (obj, args) => {
      return obj.$relatedQuery('creditCards').orderBy('id').offset(args.offset).limit(args.limit);
    },
    invoices: async (obj, args, ctx) => {
      const { limit, offset, sortBy, sortOrder } = args;
      const { to, from } = parseDateRange(args);

      const items = await ctx.models.Invoice.getAllPaginated({
        condition: { from, to, customerIds: [obj.id], jobSiteId: args.jobSiteId },
        limit,
        offset,
        sortBy,
        sortOrder,
      });
      return items;
    },
    payments: async (obj, { offset, limit }) => {
      const items = await obj
        .$relatedQuery('payments')
        .offset(offset)
        .limit(limit)
        .whereNotExists(obj.relatedQuery('orders'))
        .orWhere(builder =>
          builder.whereExists(obj.relatedQuery('orders')).andWhere('appliedAmount', '>', 0),
        )
        .orderBy(obj.ref('id'), 'desc');

      return items;
    },
  },
};
