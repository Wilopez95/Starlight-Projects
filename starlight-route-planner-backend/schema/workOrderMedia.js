import gql from 'graphql-tag';

export const typeDefs = gql`
  type WorkOrderMedia {
    id: ID!
    workOrderId: Int!
    url: String!
    timestamp: String
    author: String
    fileName: String

    createdAt: Timestamp!
    updatedAt: Timestamp!
  }
`;

export const resolvers = {
  WorkOrderMedia: {
    workOrderId: obj =>
      obj.workOrderId || obj.subscriptionWorkOrderId || obj.independentWorkOrderId,
  },
};
