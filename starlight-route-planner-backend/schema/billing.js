import gql from 'graphql-tag';

export const typeDefs = gql`
  type DailyRouteReport {
    pdfUrl: String!
  }
`;
