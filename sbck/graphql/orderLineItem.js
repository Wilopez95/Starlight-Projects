import gql from 'graphql-tag';

export const typeDefs = gql`
  type OrderLineItem {
    id: ID!

    description: String!
    price: Float!
    quantity: Int!
    total: Float!

    isService: Boolean!

    billableServiceHistoricalId: Int
    billableLineItemHistoricalId: Int

    order: Order!
  }
`;

export const resolvers = {
  OrderLineItem: {
    order: obj => obj.$relatedQuery('order'),
  },
};
