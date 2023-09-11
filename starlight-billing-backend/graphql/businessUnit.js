import gql from 'graphql-tag';

export const typeDefs = gql`
  type BusinessUnit {
    id: ID!

    active: Boolean!
    timeZoneName: String
    nameLine1: String!
    type: String!

    createdAt: String!
  }
`;

export const resolvers = {
  BusinessUnit: {
    createdAt: obj => new Date(obj.createdAt).toUTCString(),
  },
};
