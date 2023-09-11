import gql from 'graphql-tag';

export const typeDefs = gql`
  scalar Upload

  type Address {
    addressLine1: String!
    city: String!
    addressLine2: String
    fullAddress: String
    state: String
    zip: String
  }

  type Location {
    type: String!
    coordinates: Coordinates
  }

  type EnableEditModeNotice {
    message: String!
    currentlyEditingBy: String!
    editorId: String
  }

  type Media {
    id: ID!
    url: String!
    timestamp: String
    #TODO: Add additional fields (author, etc) after implementation upload media
  }

  type ParentOrderInvoicedNotice {
    message: String!
    parentOrderId: Int!
  }

  type Response {
    status: RESPONSE_STATUS!
    message: String!
  }
`;
