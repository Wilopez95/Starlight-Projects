import { GraphQLClient } from 'graphql-request';

import { generateTraceId } from '../helpers/generateTraceId';

const pricingEndpoint = 'api/pricing';
const billingEndpoint = 'api/billing';
const umsEndpoint = 'api/v1/ums';
const routePlannerEndpoint = 'api/v1/route-planner';
const recyclingEndpoint = 'api';

const SOCKET_PORT = 3010;

const billingGraphqlClient = new GraphQLClient(
  `${process.env.BILLING_API_URL as string}/${billingEndpoint}/graphql`,
  {
    credentials: 'include',
    headers: {
      'x-amzn-trace-id': generateTraceId(),
    },
  },
);

const umsGraphqlClient = new GraphQLClient(
  `${process.env.HAULING_API_URL as string}/${umsEndpoint}/graphql`,
  {
    credentials: 'include',
    headers: {
      'x-amzn-trace-id': generateTraceId(),
    },
  },
);

const routePlannerGraphqlClient = new GraphQLClient(
  `${process.env.ROUTE_PLANNER_API_URL as string}/${routePlannerEndpoint}/graphql`,
  {
    credentials: 'include',
    headers: {
      'x-amzn-trace-id': generateTraceId(),
    },
  },
);

export const apiConfig = {
  version: 'v1',
  billingGraphqlClient,
  umsGraphqlClient,
  routePlannerGraphqlClient,
  get apiUrl() {
    return `${process.env.HAULING_API_URL as string}/api/${this.version}`;
  },
  get billingApiUrl() {
    return `${process.env.BILLING_API_URL as string}/${billingEndpoint}/${this.version}`;
  },
  get umsApiUrl() {
    return `${process.env.UMS_API_URL as string}/${umsEndpoint}`;
  },
  get routePlannerApiUrl() {
    return `${process.env.ROUTE_PLANNER_API_URL as string}/${routePlannerEndpoint}`;
  },
  get recyclingApiUrl() {
    return `${process.env.RECYCLING_API_URL as string}/${recyclingEndpoint}`;
  },
  get socketApiUrl() {
    return `${process.env.HAULING_API_URL as string}:${SOCKET_PORT}`;
  },
  get pricingApiUrl() {
    return `${process.env.PRICING_API_URL as string}/${pricingEndpoint}`;
  },
};
