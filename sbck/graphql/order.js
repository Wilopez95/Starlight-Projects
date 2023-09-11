import gql from 'graphql-tag';

export const typeDefs = gql`
  type Order {
    id: ID!

    paymentMethod: PaymentMethod!
    grandTotal: Float!
    beforeTaxesTotal: Float!
    capturedTotal: Float!
    refundedTotal: Float!

    serviceDate: String!
    invoiceNotes: String

    woNumber: Int
    ticketUrl: String

    lineItems: [OrderLineItem!]!
    invoice: Invoice
    payments: [Payment]!
    jobSite: JobSite!
    customer: Customer!
    businessUnit: BusinessUnit
  }

  type PaymentRelatedOrder {
    id: ID!
    serviceDate: String!

    grandTotal: Float!
    beforeTaxesTotal: Float!
    capturedTotal: Float!
    refundedTotal: Float!

    jobSite: JobSite!

    assignedAmount: Float!
    receiptPreviewUrl: String
    receiptPdfUrl: String
  }
`;

export const resolvers = {
  Order: {
    serviceDate: obj => new Date(obj.serviceDate).toUTCString(),

    lineItems: obj => obj.$relatedQuery('lineItems').orderBy('id'),

    invoice: obj => obj.$relatedQuery('invoice'),
    payments: obj => obj.$relatedQuery('payments').orderBy('date').orderBy('id'),
    jobSite: obj => obj.$relatedQuery('jobSite'),
    customer: obj => obj.$relatedQuery('customer'),
    businessUnit: obj => obj.$relatedQuery('businessUnit'),
  },
  PaymentRelatedOrder: {
    serviceDate: obj => new Date(obj.serviceDate).toUTCString(),
    jobSite: obj => obj.$relatedQuery('jobSite'),
  },
};
