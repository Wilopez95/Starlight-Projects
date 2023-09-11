import gql from 'graphql-tag';

export const typeDefs = gql`
  type BankDeposit {
    id: ID!
    businessUnit: BusinessUnit!
    adjustments: Float!
    merchantId: String
    date: String!
    depositType: BankDepositType!
    status: BankDepositStatus!
    synced: Boolean!
    total: Float!
    pdfUrl: String
    count: Int!
    payments: [Payment!]!
  }
`;

export const resolvers = {
  BankDeposit: {
    date: obj => new Date(obj.date).toUTCString(),
    businessUnit: obj => obj.$relatedQuery('businessUnit'),
    payments: obj => obj.$getPayments(),
  },
};
