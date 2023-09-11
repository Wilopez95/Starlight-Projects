import gql from 'graphql-tag';

export const typeDefs = gql`
  type Settlement {
    id: ID!
    date: String!
    paymentGateway: PaymentGateway!
    fees: Float!
    amount: Float!
    adjustments: Float!
    count: Int!
    pdfUrl: String
    net: Float!
    mid: String!
  }
`;

export const resolvers = {
  Settlement: {
    date: obj => new Date(obj.date).toUTCString(),
  },
};
