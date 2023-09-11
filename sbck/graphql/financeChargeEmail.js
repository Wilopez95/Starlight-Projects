import gql from 'graphql-tag';

export const typeDefs = gql`
  type FinanceChargeEmail {
    id: ID!
    createdAt: String!

    receiver: String
    status: EmailEvent!
  }
`;

export const resolvers = {
  FinanceChargeEmail: {
    createdAt: obj => new Date(obj.createdAt).toUTCString(),
  },
};
