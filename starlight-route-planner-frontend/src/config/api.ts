import { GraphQLClient } from 'graphql-request';

import { generateTraceId } from '../helpers/generateTraceId';

const routePlannerEndpoint = 'api/route-planner';
const umsEndpoint = 'api/v1/ums';
const haulingEndpoint = 'api';

const commonHeaders = {};

Object.defineProperty(commonHeaders, 'x-amzn-trace-id', {
  get() {
    return generateTraceId();
  },
  enumerable: true,
  configurable: true,
});

const routePlannerGraphqlClient = new GraphQLClient(
  `${process.env.ROUTE_PLANNER_API_URL as string}/${routePlannerEndpoint}/graphql`,
  {
    credentials: 'include',
    headers: commonHeaders,
  },
);

const umsGraphqlClient = new GraphQLClient(
  `${process.env.HAULING_API_URL as string}/${umsEndpoint}/graphql`,
  {
    credentials: 'include',
    headers: commonHeaders,
  },
);

export const apiConfig = {
  version: 'v1',
  routePlannerGraphqlClient,
  umsGraphqlClient,
  get apiUrl() {
    return `${process.env.ROUTE_PLANNER_API_URL as string}/${routePlannerEndpoint}/${this.version}`;
  },
  get haulingApiUrl() {
    return `${process.env.HAULING_API_URL as string}/${haulingEndpoint}/${this.version}`;
  },
  get umsApiUrl() {
    return `${process.env.UMS_API_URL as string}/${umsEndpoint}`;
  },
};
