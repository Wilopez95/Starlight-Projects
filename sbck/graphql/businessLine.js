import gql from 'graphql-tag';

export const typeDefs = gql`
  type BusinessLine {
    id: ID!

    active: Boolean!

    name: String!
    description: String
    shortName: String
    type: String!

    createdAt: String
  }
`;

export const resolvers = {
  BusinessLine: {
    createdAt: obj => new Date(obj.createdAt).toUTCString(),
  },
};
