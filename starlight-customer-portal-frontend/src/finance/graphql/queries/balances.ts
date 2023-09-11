import { IResponseBalances } from '@root/finance/api/balances/types';
import { billingHttpClient } from '@root/finance/api/httpClient';
import { CustomerBalance } from '@root/finance/graphql/fragments';

export const customerBalance = (customerId: number) =>
  billingHttpClient.graphql<IResponseBalances>(
    `
      query getCustomerBalances($customerId: ID!) {
        customerBalances(customerId: $customerId) {
          ${CustomerBalance}
        }
      }
      `,
    { customerId },
  );
