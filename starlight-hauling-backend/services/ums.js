import pick from 'lodash/fp/pick.js';
import compact from 'lodash/compact.js';
import map from 'lodash/map.js';

import { makeUmsRequest } from '../utils/makeRequest.js';
import { generateTraceId } from '../utils/generateTraceId.js';

import { AMQP_CUSTOMER_CONTACTS_QUEUE } from '../config.js';
import { createServiceToken } from './tokens.js';
import MqSender from './amqp/sender.js';

const mqSender = MqSender.getInstance();

const getUpsertData = pick([
  'firstName',
  'lastName',
  'email',
  'customerId',
  'tenantName',
  'tenantId',
  'isMainContact',
  'prevMainContactEmail',
  'hasCustomerPortalAccess',
  'label',
  'subLabel',
  'loginUrl',
]);

const ME_QUERY = `
query {
    me {
        id
        firstName
        lastName
        email
        resource
        permissions
        tenantId
        tenantName
    }
}
`;

const RESOURCE_INFO = `
query getResource($srn: String!) {
    resource(srn: $srn) {
        srn
        type
        loginUrl
    }
}
`;

const GET_USER_BY_EMAIL = `
query getUser($email: String!, $resource: String!) {
    user(filter: { email: $email }) {
        id
        email
        name
        firstName
        lastName
        tenantId
        tenantName
        phones {
            number
        }
        availableActions(resource: $resource)
    }
}
`;

const GET_USER_BY_ID = `
query getUser($id: String!) {
    user(id: $id) {
        id
        email
        name
        firstName
        lastName
        tenantId
        phones {
            number
        }
        tenantName
    }
}
`;

const GET_USERS_BY_IDS = `
query getUsersByIds($ids: [String!]!, $raw: Boolean) {
    users(ids: $ids, raw: $raw) {
        id
        name
        email
    }
}
`;

export const initLogin = (ctx, { resource, redirectUri, serviceToken }) =>
  makeUmsRequest(ctx, {
    serviceToken,
    method: 'post',
    url: '/auth/login',
    data: {
      redirectUri,
      resource,
    },
  });

export const refreshToken = (ctx, token) =>
  makeUmsRequest(ctx, {
    method: 'post',
    url: '/auth/refresh',
    token,
  });

export const initLogout = (ctx, { redirectUri, token }) =>
  makeUmsRequest(ctx, {
    method: 'post',
    url: '/auth/logout',
    data: { redirectUri },
    token,
  });

export const exchangeCodeForToken = (ctx, { code, redirectUri, serviceToken }) =>
  makeUmsRequest(ctx, {
    serviceToken,
    method: 'post',
    url: '/auth/token',
    data: { code, redirectUri },
  });

export const fetchResourceInfo = (ctx, { srn, serviceToken }) =>
  makeUmsRequest(ctx, {
    serviceToken,
    method: 'post',
    url: '/graphql',
    data: {
      query: RESOURCE_INFO,
      variables: {
        srn,
      },
    },
  });

export const meRequest = (ctx, accessToken) =>
  makeUmsRequest(ctx, {
    token: accessToken,
    method: 'post',
    url: '/graphql',
    data: { query: ME_QUERY },
  });

export const getUserByEmail = (ctx, { serviceToken, email, resource }) =>
  makeUmsRequest(ctx, {
    serviceToken,
    method: 'post',
    url: '/graphql',
    data: {
      query: GET_USER_BY_EMAIL,
      variables: { email, resource },
    },
  });

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

export const getSalesRepEmails = (ctx, { serviceToken, ids }) =>
  makeUmsRequest(ctx, {
    serviceToken,
    method: 'post',
    url: '/graphql',
    data: {
      query: GET_USERS_BY_IDS,
      variables: { ids },
    },
  });

export const upsertCustomerPortalUser = (ctxState, data) =>
  mqSender.sendTo(
    { state: ctxState, logger: ctxState.logger },
    AMQP_CUSTOMER_CONTACTS_QUEUE,
    getUpsertData(data),
  );

export const getUsersByIds = (ctx, { serviceToken, ids, raw = true }) =>
  makeUmsRequest(ctx, {
    serviceToken,
    method: 'post',
    url: '/graphql',
    data: {
      query: GET_USERS_BY_IDS,
      variables: { ids, raw },
    },
  });

export const LOBBY_RESOURCE = 'srn:global:global:lobby';

export const getUsersAsMap = async (ctx, ids) => {
  const reqId = generateTraceId();

  const serviceToken = await createServiceToken(
    {},
    {
      audience: 'ums',
      subject: LOBBY_RESOURCE,
      requestId: reqId,
    },
  );

  const result = await getUsersByIds(ctx, { serviceToken, ids, raw: true });

  const users = compact(result?.data?.users);
  const usersMap = new Map();
  users?.forEach(({ id, name }) => usersMap.set(id, name));

  return usersMap;
};

export const populateUserNames = async (comparedItems, ctx) => {
  const ids = [...new Set(map(comparedItems, 'userId'))];
  const systemIdx = ids.indexOf('system');
  systemIdx !== -1 && ids.splice(systemIdx, 1);

  const usersMap = await getUsersAsMap(ctx, ids);

  comparedItems.forEach(item => {
    const userName = usersMap.get(String(item.userId));
    if (userName) {
      item.user = userName;
    } else if (item.userId === 'system') {
      item.user = 'System';
    } else {
      item.user = 'Unknown';
    }
  });
};
