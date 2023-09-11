import { GraphqlVariables } from '@root/core/api/base';
import { billingHttpClient } from '@root/finance/api/httpClient';
import { CustomerStatementsResponse } from '@root/finance/api/statement/types';
import { StatementFragment } from '@root/finance/graphql/fragments';

export const getList = (
  variables: GraphqlVariables & {
    customerId?: number;
    businessUnitId?: number;
  },
) =>
  billingHttpClient.graphql<CustomerStatementsResponse>(
    `
      query getCustomerStatements($offset: Int, $limit: Int, $customerId: ID, $businessUnitId: ID, $sortBy: StatementSorting, $sortOrder: SortOrder) {
          statements(offset: $offset, limit: $limit, customerId: $customerId, businessUnitId: $businessUnitId, sortBy: $sortBy, sortOrder: $sortOrder) {
            ${StatementFragment}
          }
      }
    `,
    variables,
  );
