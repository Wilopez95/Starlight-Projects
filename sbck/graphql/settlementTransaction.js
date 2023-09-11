import gql from 'graphql-tag';

export const typeDefs = gql`
  type SettlementTransaction {
    id: ID!

    settlement: Settlement!
    payment: Payment
    amount: Float!
    fee: Float!
    adjustment: Float!
    transactionNote: String
    spUsed: Boolean
  }
`;

export const resolvers = {
  SettlementTransaction: {
    settlement: obj => obj.$relatedQuery('settlement'),
  },
};
