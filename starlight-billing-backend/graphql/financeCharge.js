import gql from 'graphql-tag';

export const typeDefs = gql`
  type FinanceCharge {
    id: ID!

    createdAt: String!

    total: Float!
    balance: Float!
    pdfUrl: String
    exagoPath: String!

    customer: Customer!
    invoice: Invoice!
    invoices: [Invoice!]!
    statement: Statement!
    payments: [Payment]
    emails: [FinanceChargeEmail]
  }

  input FinanceChargeFilters {
    filterByStatus: [InvoiceStatus!]
    filterByCustomer: [CustomerType!]
    filterByCreatedFrom: String
    filterByCreatedTo: String
    filterByAmountFrom: Float
    filterByAmountTo: Float
    filterByBalanceFrom: Float
    filterByBalanceTo: Float
    filterByUser: [ID!]
  }

  input FinanceChargeInput {
    businessUnitId: ID
    customerId: ID!
    financeChargeApr: Float!
    financeChargeInvoices: [FinanceChargeInvoiceInput!]!
  }

  input FinanceChargeInvoiceInput {
    statementId: ID!
    invoiceId: ID!
    fine: Float!
  }

  type FinanceChargeResult {
    customersCount: Int!
    invoicesCount: Int!
    invoicesTotal: Float!
  }
`;

export const resolvers = {
  FinanceCharge: {
    createdAt: obj => new Date(obj.createdAt).toUTCString(),
    customer: obj => obj.$relatedQuery('customer'),
    statement: obj => obj.$relatedQuery('statement'),
    invoice: obj => obj.$relatedQuery('invoice'),
    invoices: obj => obj.$relatedQuery('invoices').orderBy('id'),
    payments: obj => obj.$relatedQuery('payments').orderBy('id'),
    emails: obj => obj.$relatedQuery('emails').orderBy('id'),
  },
};
