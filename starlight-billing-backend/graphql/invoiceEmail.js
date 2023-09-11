import gql from 'graphql-tag';

export const typeDefs = gql`
  type InvoiceEmail {
    id: ID!
    createdAt: String!

    receiver: String
    status: EmailEvent!
  }
`;

export const resolvers = {
  InvoiceEmail: {
    createdAt: obj => new Date(obj.createdAt).toUTCString(),
  },
};
