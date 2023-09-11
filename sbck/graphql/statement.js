import gql from 'graphql-tag';

export const typeDefs = gql`
  type Statement {
    id: ID!

    createdAt: String!

    statementDate: String!
    endDate: String!

    invoicesCount: Int!
    invoicesTotal: Float!
    paymentsTotal: Float!
    balance: Float!
    pdfUrl: String
    prevPdfUrl: String
    exagoPath: String!
    prevBalance: Float!

    customer: Customer!
    emails: [StatementEmail]

    financeChargeExists: Boolean
  }
`;

export const resolvers = {
  Statement: {
    createdAt: obj => new Date(obj.createdAt).toUTCString(),
    statementDate: obj => new Date(obj.statementDate).toUTCString(),
    endDate: obj => new Date(obj.endDate).toUTCString(),
    customer: obj => obj.$relatedQuery('customer'),
    emails: obj => obj.$relatedQuery('emails').orderBy('id'),

    financeChargeExists: async obj => {
      const fc = await obj.$relatedQuery('financeCharge');
      //TODO: delete isArray check after DB squash
      return Array.isArray(fc) ? !!fc?.length : !!fc;
    },
  },
};
