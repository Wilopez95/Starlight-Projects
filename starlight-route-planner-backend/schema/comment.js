import gql from 'graphql-tag';

export const typeDefs = gql`
  type Comment {
    id: ID!
    workOrderId: Int!
    eventType: COMMENTS_EVENT_TYPE!
    authorId: String
    authorName: String
    authorRole: String
    comment: String

    createdAt: Timestamp!
    updatedAt: Timestamp!
  }

  input CreateCommentInput {
    workOrderId: Int!
    eventType: COMMENTS_EVENT_TYPE!
    comment: String
  }
`;
