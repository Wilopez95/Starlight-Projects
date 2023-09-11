import gql from 'graphql-tag';
import { GraphQLClient } from 'graphql-request';

import { BILLING_SERVICE_API_URL } from '../../../config';
import { getSdk } from './graphql';
export * from './graphql';

if (!BILLING_SERVICE_API_URL) {
  throw new Error('Billing service API URL not found');
}

gql`
  query getCustomerBalances($customerId: ID!) {
    customerBalances(customerId: $customerId) {
      availableCredit
      balance
      creditLimit
      nonInvoicedTotal
      prepaidOnAccount
      prepaidDeposits
      paymentDue
    }
  }
`;

const client = new GraphQLClient(`${BILLING_SERVICE_API_URL}/graphql`);

export const api = getSdk(client);
