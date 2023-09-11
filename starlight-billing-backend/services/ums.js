import { makeUmsRequest } from '../utils/makeRequest.js';

const GET_USER_BY_ID = `
query getUser($id: String!) {
    user(id: $id) {
        id
        email
        name
        firstName
        lastName
        tenantId
        tenantName
    }
}
`;

export const getUserById = (ctx, { serviceToken, userId }) =>
  makeUmsRequest(ctx, {
    serviceToken,
    method: 'post',
    url: '/graphql',
    data: {
      query: GET_USER_BY_ID,
      variables: { id: userId },
    },
  });
