import { BaseGraphqlService, billingHttpClient } from '../../../../api/base';
import { GraphqlVariables } from '../../../../api/base/types';
import { IBankDeposit } from '../types';

import { BankDepositFragment, DetailedBankDepositFragment } from './fragments';
import { type AllBankDepositsResponse, type BankDepositByIdResponse } from './types';

export class BankDepositService extends BaseGraphqlService {
  getAll(variables: GraphqlVariables & { businessUnitId: string }) {
    return this.graphql<AllBankDepositsResponse>(
      `
    query BankDeposits($offset: Int, $limit: Int, $businessUnitId: ID!, $sortBy: DepositSorting, $sortOrder: SortOrder) {
      bankDeposits(offset: $offset, limit: $limit, businessUnitId: $businessUnitId, sortBy: $sortBy, sortOrder: $sortOrder)
      {
        ${BankDepositFragment}
      }
    }`,
      variables,
    );
  }

  getById(variables: GraphqlVariables & { id: number }) {
    return this.graphql<BankDepositByIdResponse>(
      `
      query getBankDepositById($id: ID!) {
        bankDeposit(id: $id) {
          ${DetailedBankDepositFragment}
        }
      }
    `,
      variables,
    );
  }

  deleteBankDeposit(id: number) {
    return this.graphql(
      `
      mutation DeleteBankDeposit($id: ID!) {
        deleteBankDeposit(id: $id)
      }
      `,
      {
        id,
      },
    );
  }

  lockBankDeposit(businessUnitId: string, date: string) {
    return this.graphql<{ lockBankDeposit: IBankDeposit | null }>(
      `
      mutation LockBankDeposit($businessUnitId: ID!, $date: String!) {
        lockBankDeposit(businessUnitId: $businessUnitId, date: $date) {
          ${BankDepositFragment}
        }
      }
      `,
      {
        businessUnitId,
        date,
      },
    );
  }

  unlockBankDeposit(id: number, businessUnitId: string) {
    return this.graphql<{ unlockBankDeposit: boolean }>(
      `
      mutation UnlockBankDeposit($id: ID!, $businessUnitId: ID!) {
        unlockBankDeposit(id: $id, businessUnitId: $businessUnitId)
      }
      `,
      {
        id,
        businessUnitId,
      },
    );
  }

  static async downloadBankDeposit(query: string) {
    return billingHttpClient.get(`bank-deposits/download?${query}`);
  }
}
