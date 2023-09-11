import { GraphQLClient } from 'graphql-request';

import { generateTraceId } from '../helpers/generateTraceId';

const billingEndpoint = 'billing/graphql';
const umsEndpoint = 'api/v1';
const customerPortal = 'api/customer-portal/v1';
const pricingEndpoint = 'api/pricing';

const billingGraphqlClient = new GraphQLClient(
  `${process.env.BILLING_API_URL as string}/${customerPortal}/${billingEndpoint}`,
  {
    credentials: 'include',
    headers: {
      'x-amzn-trace-id': generateTraceId(),
    },
  },
);

const umsGraphqlClient = new GraphQLClient(
  `${process.env.HAULING_API_URL as string}/${customerPortal}/${umsEndpoint}`,
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
  get apiUrl() {
    return `${process.env.HAULING_API_URL as string}/api/${this.version}`;
  },
  get apiCP() {
    return `${process.env.CUSTOMER_PORTA_URL as string}/${customerPortal}`;
  },
  get billingApiUrl() {
    return `${process.env.BILLING_API_URL as string}/${billingEndpoint}/${this.version}`;
  },
  get umsApiUrl() {
    return `${process.env.UMS_API_URL as string}/${umsEndpoint}`;
  },
  get pricingApiUrl() {
    return `${process.env.PRICING_API_URL as string}/${pricingEndpoint}`;
  },
};
