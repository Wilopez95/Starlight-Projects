import { BaseGraphqlService, billingHttpClient } from '../../../../api/base';
import { GraphqlVariables } from '../../../../api/base/types';
import { type AppliedFilterState } from '../../../../common/TableTools/TableFilter';
import { ICustomerWithFinalChargeDraft } from '../../../../types';
import { IFinanceChargeDraftData } from '../types';

import {
  DetailedFinanceChargeFragment,
  FinanceChargeFragment,
  FinanceChargeFragmentCustomer,
} from './fragments';
import {
  FinanceChargeByIdResponse,
  FinanceChargeResponse,
  FinancialChargeCreatedDataResponse,
  ISendFinanceChargeData,
} from './types';

export class FinanceChargeService extends BaseGraphqlService {
  getFinanceCharges(
    variables: GraphqlVariables & {
      businessUnitId: number;
      filters?: AppliedFilterState;
    },
  ) {
    return this.graphql<FinanceChargeResponse>(
      `
    query FinanceCharges($offset: Int, $limit: Int, $businessUnitId: ID, $filters: FinanceChargeFilters, $query: String, $sortBy: FinanceChargesSorting, $sortOrder: SortOrder) {
      financeCharges(offset: $offset, limit: $limit, businessUnitId: $businessUnitId, filters: $filters, query: $query, sortBy: $sortBy, sortOrder: $sortOrder)
      {
        ${FinanceChargeFragment}
      }
    }`,
      variables,
    );
  }

  getFinanceChargesByCustomer(
    variables: GraphqlVariables & {
      customerId: number;
    },
  ) {
    return this.graphql<FinanceChargeResponse>(
      `
      query FinanceChargesByCustomer($customerId: ID, $offset: Int, $limit: Int, $filters: FinanceChargeFilters, $query: String, $sortBy: FinanceChargesSorting, $sortOrder: SortOrder) {
        financeCharges(customerId: $customerId, offset: $offset, limit: $limit, filters: $filters, query: $query, sortBy: $sortBy, sortOrder: $sortOrder)
          {
            ${FinanceChargeFragment}
            customer {
              ${FinanceChargeFragmentCustomer}
            }
          }
        }

    `,
      variables,
    );
  }

  getDetailedById(variables: { id: number }) {
    return this.graphql<FinanceChargeByIdResponse>(
      `
      query getFinanceChargesById($id: ID!) {
        financeCharge(id: $id) {
          ${DetailedFinanceChargeFragment}
        }
      }
    `,
      variables,
    );
  }

  createFinancialCharge(draftData: IFinanceChargeDraftData[]) {
    return this.graphql<FinancialChargeCreatedDataResponse>(
      `
      mutation CreateFinanceCharge($data: [FinanceChargeInput!]!) {
        createFinanceCharge(data: $data)
      }
    `,
      {
        data: draftData,
      },
    );
  }

  static getFinancialChargesDrafts(statementIds: number[]) {
    return billingHttpClient.post<
      {
        id: number[];
      },
      ICustomerWithFinalChargeDraft[]
    >('statements/finance-charge-draft', {
      id: statementIds,
    });
  }

  sendFinanceCharges({ ids, emails }: ISendFinanceChargeData) {
    return this.graphql<string>(
      `
      mutation SendFinanceCharges(
        $ids: [ID!]!
        $emails: [String!]
      ) {
        sendFinanceCharges(
         ids: $ids, emails: $emails)
      }
      `,
      { ids, emails },
    );
  }

  static async downloadFinanceCharges(query: string) {
    return billingHttpClient.get(`finance-charges/download?${query}`);
  }
}
