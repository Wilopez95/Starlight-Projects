import { gql } from '@apollo/client';

export default gql`
  "user info from token, local state"
  type UserInfo {
    id: String!
    email: String!
    token: String!
    expiresAt: String!
    refreshToken: String!
    refreshExpiresAt: String!
    resource: String!
    lastName: String!
    firstName: String!
    resource: String!
    permissions: [String]!
  }

  input UserInfoInput {
    id: String!
    email: String!
    token: String!
    expiresAt: String!
    refreshToken: String!
    refreshExpiresAt: String!
    resource: String!
    lastName: String!
    firstName: String!
    resource: String!
    permissions: [String]!
  }

  extend type Query {
    "user info from token, local state"
    userInfo: UserInfo!
    "is user logged in, local state"
    isLoggedIn: Boolean!
  }

  extend type Mutation {
    "store token in local state"
    setUserInfo(userInfo: UserInfoInput!): Boolean
    "log out current user. clear user related local state"
    logOut: Boolean
  }
`;
