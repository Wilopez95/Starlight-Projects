import gql from 'graphql-tag';

export const typeDefs = gql`
  type BatchStatement {
    id: ID!

    createdAt: String!

    statementDate: String!
    endDate: String!

    count: Int!
    total: Float!

    businessUnit: BusinessUnit!
    statements: [Statement!]!
  }
`;

export const resolvers = {
  BatchStatement: {
    createdAt: obj => new Date(obj.createdAt).toUTCString(),
    statementDate: obj => new Date(obj.statementDate).toUTCString(),
    endDate: obj => new Date(obj.endDate).toUTCString(),
    businessUnit: obj => obj.$relatedQuery('businessUnit'),
    statements: obj => obj.$relatedQuery('statements').orderBy('id'),
  },
};
