import { BaseGraphqlService, billingHttpClient } from '../../../../api/base';
import { GraphqlVariables } from '../../../../api/base/types';
import { INewBatchStatement } from '../types';

import {
  BatchStatementFragment,
  CustomerLastStatementFragment,
  DetailedBatchStatementFragment,
} from './fragments';
import {
  BatchStatementDetailsResponse,
  BatchStatementResponse,
  PreviousStatementBalanceResponse,
} from './types';

export class BatchStatementService extends BaseGraphqlService {
  getBatchStatements(
    variables: GraphqlVariables & {
      businessUnitId: string;
    },
  ) {
    return this.graphql<BatchStatementResponse>(
      `
    query BatchStatements($offset: Int, $limit: Int, $businessUnitId: ID, $sortBy: BatchStatementSorting, $sortOrder: SortOrder) {
      batchStatements(offset: $offset, limit: $limit, businessUnitId: $businessUnitId, sortBy: $sortBy, sortOrder: $sortOrder)
      {
        ${BatchStatementFragment}
      }
    }`,
      variables,
    );
  }

  getBatchStatement(
    variables: GraphqlVariables & {
      id: number;
    },
  ) {
    return this.graphql<BatchStatementDetailsResponse>(
      `
    query BatchStatement($id: ID!) {
      batchStatement(id: $id)
      {
        ${DetailedBatchStatementFragment}
      }
    }`,
      variables,
    );
  }

  requestPreviousStatementsBalance(
    variables: GraphqlVariables & {
      ids: number[];
    },
  ) {
    return this.graphql<PreviousStatementBalanceResponse>(
      `
    query CustomersLastStatementBalance($ids: [ID!]!) {
      customersLastStatementBalance(ids: $ids)
      {
        ${CustomerLastStatementFragment}
      }
    }`,
      variables,
    );
  }

  sendBatchStatements(ids: number[]) {
    return this.graphql<string>(
      `
      mutation SendBatchStatements(
        $ids: [ID!]!
      ) {
        sendBatchStatements(
         ids: $ids)
      }
      `,
      { ids },
    );
  }

  createBatchStatement(data: INewBatchStatement & { businessUnitId: string }) {
    return this.graphql<{ createBatchStatement: string | null }>(
      `
      mutation CreateBatchStatement($customerIds: [ID!]!, $businessUnitId: ID!, $statementDate: String!, $endDate: String!) {
        createBatchStatement(customerIds: $customerIds, businessUnitId: $businessUnitId, statementDate: $statementDate, endDate: $endDate)
      }
    `,
      {
        ...data,
      },
    );
  }

  static async downloadBatchStatements(query: string) {
    return billingHttpClient.get(`batch-statements/download?${query}`);
  }
}
