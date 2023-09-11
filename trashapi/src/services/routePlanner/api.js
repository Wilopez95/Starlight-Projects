/* eslint-disable prefer-const */
import { ROUTE_PLANNER_URL } from '../../config.js';
import { createToken } from '../../auth/serviceToken.js';
import getToken from '../../utils/getToken.js';
import { makeRoutePlannerGraphRequest } from './common.js';
import {
  DRIVER_DAILY_ROUTES,
  UPDATE_DAILY_ROUTE,
  UPDATE_WORK_ORDER,
  WORK_ORDER_NOTES,
  WEIGHT_TICKETS,
  CREATE_WEIGHT_TICKET,
  UPDATE_WEIGHT_TICKET,
  WORK_ORDER_NOTES_COUNT,
  LANDFILLS,
} from './queries.js';

const createAuthorizationHeader = async ({ serviceToken, schemaName, req }) => {
  let token;

  if (serviceToken) {
    return `ServiceToken ${serviceToken}`;
  }

  const accessToken = getToken(req) || req.user?.userAccessToken;

  if (accessToken) {
    return `Bearer ${accessToken}`;
  }

  const tenantName = schemaName || req.user?.tenantName;

  if (!tenantName) {
    throw Error('At least schemaName should be provided when calling route planner api');
  }

  const subject = String(req.user?.userId) || 'unknown';
  const { reqId: requestId } = req;
  token = await createToken(
    { schemaName: tenantName, tenantName },
    {
      subject,
      requestId,
      audience: ROUTE_PLANNER_URL,
    },
  );

  return `ServiceToken ${token}`;
};

export const fetchDailyRoutesByDriver = async (
  req,
  { serviceToken, schemaName, serviceDate, driverId } = {},
) => {
  const authHeader = await createAuthorizationHeader({
    schemaName,
    serviceToken,
    req,
  });

  const result = await makeRoutePlannerGraphRequest({
    req,
    data: {
      query: DRIVER_DAILY_ROUTES,
      variables: {
        serviceDate,
        driverId,
      },
    },
    headers: {
      Authorization: authHeader,
    },
  });
  return result;
};

export const updateDailyRouteAndFetch = async (
  req,
  { serviceToken, schemaName, id, body } = {},
) => {
  const authHeader = await createAuthorizationHeader({
    schemaName,
    serviceToken,
    req,
  });

  const result = await makeRoutePlannerGraphRequest({
    req,
    data: {
      query: UPDATE_DAILY_ROUTE,
      variables: {
        id: Number.parseInt(id),
        body,
      },
    },
    headers: {
      Authorization: authHeader,
    },
  });

  return result;
};

export const updateWorkOrderAndFetch = async (req, { serviceToken, schemaName, id, body } = {}) => {
  const authHeader = await createAuthorizationHeader({
    schemaName,
    serviceToken,
    req,
  });

  try {
    const result = await makeRoutePlannerGraphRequest({
      req,
      data: {
        query: UPDATE_WORK_ORDER,
        variables: {
          id: Number.parseInt(id),
          body,
        },
      },
      headers: {
        Authorization: authHeader,
      },
    });
    return result;
  } catch (error) {
    logger.error(error);
  }
};

export const fetchWorkOrderNotes = async (req, { serviceToken, schemaName, id } = {}) => {
  const authHeader = await createAuthorizationHeader({
    schemaName,
    serviceToken,
    req,
  });

  const result = await makeRoutePlannerGraphRequest({
    req,
    data: {
      query: WORK_ORDER_NOTES,
      variables: {
        id: Number.parseInt(id),
      },
    },
    headers: {
      Authorization: authHeader,
    },
  });
  return result;
};

export const fetchWeightTickets = async (req, { serviceToken, schemaName, id } = {}) => {
  const authHeader = await createAuthorizationHeader({
    schemaName,
    serviceToken,
    req,
  });

  const result = await makeRoutePlannerGraphRequest({
    req,
    data: {
      query: WEIGHT_TICKETS,
      variables: {
        dailyRouteId: Number.parseInt(id),
      },
    },
    headers: {
      Authorization: authHeader,
    },
  });
  return result;
};

export const createWeightTicketAndFetch = async (
  req,
  { serviceToken, schemaName, id, body } = {},
) => {
  const authHeader = await createAuthorizationHeader({
    schemaName,
    serviceToken,
    req,
  });

  const { url, ...params } = body || {};

  const result = await makeRoutePlannerGraphRequest({
    req,
    data: {
      query: CREATE_WEIGHT_TICKET,
      variables: {
        body: {
          ...params,
          dailyRouteId: Number.parseInt(id),
        },
        url,
      },
    },
    headers: {
      Authorization: authHeader,
    },
  });
  return result;
};

export const updateWeightTicketAndFetch = async (
  req,
  { serviceToken, schemaName, id, body } = {},
) => {
  const authHeader = await createAuthorizationHeader({
    schemaName,
    serviceToken,
    req,
  });

  const { url, ...params } = body || {};

  const result = await makeRoutePlannerGraphRequest({
    req,
    data: {
      query: UPDATE_WEIGHT_TICKET,
      variables: {
        id: Number.parseInt(id),
        body: params,
        url,
      },
    },
    headers: {
      Authorization: authHeader,
    },
  });
  return result;
};

export const fetchWorkOrderNotesCount = async (req, { serviceToken, schemaName, id } = {}) => {
  const authHeader = await createAuthorizationHeader({
    schemaName,
    serviceToken,
    req,
  });

  const result = await makeRoutePlannerGraphRequest({
    req,
    data: {
      query: WORK_ORDER_NOTES_COUNT,
      variables: {
        id: Number.parseInt(id),
      },
    },
    headers: {
      Authorization: authHeader,
    },
  });
  return result;
};

export const fetchLandfills = async (req, { serviceToken, schemaName } = {}) => {
  const authHeader = await createAuthorizationHeader({
    schemaName,
    serviceToken,
    req,
  });

  const result = await makeRoutePlannerGraphRequest({
    req,
    data: {
      query: LANDFILLS,
      variables: {
        onlyLandfills: false,
      },
    },
    headers: {
      Authorization: authHeader,
    },
  });
  return result;
};
