import gql from 'graphql-tag';

export const typeDefs = gql`
  type StatementEmail {
    id: ID!
    createdAt: String!

    receiver: String
    status: EmailEvent!
  }
`;

export const resolvers = {
  StatementEmail: {
    createdAt: obj => new Date(obj.createdAt).toUTCString(),
  },
};
