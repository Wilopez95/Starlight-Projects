import gql from 'graphql-tag';

export const typeDefs = gql`
  type JobSite {
    id: ID!
    name: String
    addressLine1: String!
    addressLine2: String
    city: String!
    state: String!
    zip: String!
  }
`;

export const resolvers = {
  JobSite: {},
};
