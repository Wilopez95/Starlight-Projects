import { GraphQLClient } from 'graphql-request';
import { generateTraceId } from '../helpers';
import { TRASH_API_URL } from '../../helpers';

const trashApi = 'trashapi';

const trashapiGraphqlClient = new GraphQLClient(`${TRASH_API_URL as string}/${trashApi}`, {
  credentials: 'include',
  headers: {
    'x-amzn-trace-id': generateTraceId(),
  },
});

export const apiConfig = {
  version: 'v1',
  trashapiGraphqlClient,
  get apiUrl() {
    return `${TRASH_API_URL as string}/${trashApi}/${this.version}`;
  },
};
