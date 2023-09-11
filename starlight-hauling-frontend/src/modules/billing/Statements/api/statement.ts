import { BaseGraphqlService, billingHttpClient, GraphqlVariables } from '../../../../api/base';
import { Maybe } from '../../../../types';
import { INewStatement, IStatement } from '../types';

import { DetailedStatementFragment, StatementFragment } from './fragments';
import { type CustomerStatementsResponse } from './types';

export enum StatementSorting {
  CREATED_AT = 'CREATED_AT',
}

export class StatementService extends BaseGraphqlService {
  getStatements(
    variables: GraphqlVariables & {
      customerId?: number;
      businessUnitId?: number;
    },
  ) {
    return this.graphql<CustomerStatementsResponse>(
      `
      query getCustomerStatements($offset: Int, $limit: Int, $customerId: ID, $businessUnitId: ID, $sortBy: StatementSorting, $sortOrder: SortOrder) {
          statements(offset: $offset, limit: $limit, customerId: $customerId, businessUnitId: $businessUnitId, sortBy: $sortBy, sortOrder: $sortOrder) {
            ${StatementFragment}
          }
      }
    `,
      variables,
    );
  }

  createStatement(customerId: number, data: INewStatement & { businessUnitId: string }) {
    return this.graphql<{ createStatement: string | null }>(
      `
      mutation CreateStatement($customerId: ID!, $businessUnitId: ID!, $statementDate: String!, $endDate: String!) {
        createStatement(customerId: $customerId, businessUnitId: $businessUnitId, statementDate: $statementDate, endDate: $endDate)
      }
      `,
      {
        customerId,
        ...data,
      },
    );
  }

  getStatementById(statementId: number) {
    return this.graphql<{ statement: Maybe<IStatement> }>(
      `
      query RequestStatement($statementId: ID!) {
        statement(id: $statementId) {
          ${DetailedStatementFragment}
        }
      }
      `,
      { statementId },
    );
  }

  deleteStatement(statementId: number) {
    return this.graphql<{ deleteStatement: boolean }>(
      `
      mutation DeleteStatement($statementId: ID!) {
        deleteStatement(id: $statementId)
      }
      `,
      { statementId },
    );
  }

  sendStatements(statementIds: number[], emails: string[] = []) {
    return this.graphql<{ sendStatement: boolean }>(
      `
      mutation SendStatements($statementIds: [ID!]!, $emails: [String!]) {
        sendStatements(ids: $statementIds, emails: $emails)
      }
      `,
      { statementIds, emails },
    );
  }

  requestStatementEndDate(customerId: number) {
    return this.graphql<{ newStatementEndDate: Date }>(
      `
      query StatementEndDate($customerId: ID!) {
        newStatementEndDate(customerId: $customerId)
      }
      `,
      { customerId },
    );
  }

  static async downloadStatements(query: string) {
    return billingHttpClient.get(`statements/download?${query}`);
  }
}
