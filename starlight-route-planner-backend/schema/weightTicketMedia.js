import gql from 'graphql-tag';

import { DEFAULT_PRIVATE_MEDIA_URL } from '../consts/weightTicketMedia.js';

export const typeDefs = gql`
  type WeightTicketMedia {
    id: ID!
    weightTicketId: Int!
    url: String!
    timestamp: String
    author: String
    fileName: String
  }
`;

export const resolvers = {
  WeightTicketMedia: {
    url: obj => {
      if (obj.url === DEFAULT_PRIVATE_MEDIA_URL) {
        return obj.$modelClass.getRecyclingTicketUrlByTicketId(obj.weightTicketId);
      }

      return obj.url;
    },
  },
};
