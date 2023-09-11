import gql from 'graphql-tag';

export const typeDefs = gql`
  type Address {
    addressLine1: String!
    addressLine2: String
    zip: String
    city: String
    state: String
  }

  input CreditCardInput {
    active: Boolean!
    cardNickname: String
    addressLine1: String!
    addressLine2: String
    city: String!
    state: String!
    zip: String!
    nameOnCard: String!
    expirationDate: String!
    cardNumber: String!
    cvv: String!
  }
`;
