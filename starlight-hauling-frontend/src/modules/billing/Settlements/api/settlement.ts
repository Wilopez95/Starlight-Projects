import { BaseGraphqlService, billingHttpClient } from '../../../../api/base';
import { GraphqlVariables } from '../../../../api/base/types';
import { SettlementCreateParams } from '../store/types';

import { SettlementFragment, SettlementTransactionFragment } from './fragments';
import {
  type AllSettlementsResponse,
  type RequestSettlementResponse,
  type SettlementByIdResponse,
  type SettlementTransactionsResponse,
} from './types';

export class SettlementService extends BaseGraphqlService {
  getAll(variables: GraphqlVariables & { businessUnitId: number; from?: string; to?: string }) {
    return this.graphql<AllSettlementsResponse>(
      `
    query getAllSettlements($businessUnitId: ID!, $offset: Int, $limit: Int, $from: String, $to: String, $sortBy: SettlementsSorting, $sortOrder:SortOrder) {
      settlements(businessUnitId: $businessUnitId, offset: $offset, limit: $limit, from: $from, to: $to, sortBy: $sortBy, sortOrder: $sortOrder)
      {
        ${SettlementFragment}
      }
      settlementsCount(businessUnitId: $businessUnitId)
    }`,
      variables,
    );
  }

  getById(variables: GraphqlVariables & { id: number }) {
    return this.graphql<SettlementByIdResponse>(
      `
      query getSettlementById($id: ID!) {
        settlement(id: $id) {
          ${SettlementFragment}
        }
      }
    `,
      variables,
    );
  }

  requestSettlement(params: SettlementCreateParams) {
    return this.graphql<RequestSettlementResponse>(
      `
      mutation requestSettlement($date: String!, $merchantId: ID!, $businessUnitId: ID!, $mid: String!) {
        requestSettlement(date: $date, merchantId: $merchantId, businessUnitId: $businessUnitId, mid: $mid)
      }
      `,
      params,
    );
  }

  deleteSettlements(ids: number[]) {
    return this.graphql(
      `
      mutation deleteSettlements($ids: [ID!]!) {
        deleteSettlements(ids: $ids)
      }
      `,
      {
        ids,
      },
    );
  }

  static getSettlementTransactions(variables: GraphqlVariables & { settlementId: number }) {
    return billingHttpClient.graphql<SettlementTransactionsResponse>(
      `
      query settlementTransactions($settlementId: ID!, $offset: Int, $limit: Int) {
        settlementTransactions(settlementId: $settlementId, offset: $offset, limit: $limit) {
          ${SettlementTransactionFragment}
        }
      }
      `,
      variables,
    );
  }

  static async downloadSettlements(query: string) {
    return billingHttpClient.get(`settlements/download?${query}`);
  }
}
