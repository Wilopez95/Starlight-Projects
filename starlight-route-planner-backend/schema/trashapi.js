import gql from 'graphql-tag';

import { RESOLVE_TYPE } from '../consts/resolveTypes.js';

export const typeDefs = gql`
  union TrashapiNote = Comment | WorkOrderMedia

  type TrashapiNotesCount {
    count: Int!
  }
`;

export const resolvers = {
  TrashapiNote: {
    __resolveType(res) {
      if (res.comment) {
        return RESOLVE_TYPE.comment;
      }

      if (res.url) {
        return RESOLVE_TYPE.workOrderMedia;
      }

      return null;
    },
  },
};
