import { omit } from 'lodash-es';

import { BaseGraphqlService, GraphqlVariables, PaymentTypeEnum } from '../../../../api/base';
import { type AppliedFilterState } from '../../../../common/TableTools/TableFilter';

import { DetailedPayoutFragment, PayoutFragment } from './fragments';
import {
  type CustomerPayoutResponse,
  type CustomerPayoutsResponse,
  type PayoutResponse,
} from './response';
import { CreatePayoutPayload } from './types';

export enum PayoutSorting {
  DATE = 'DATE',
  PAYMENT_TYPE = 'PAYMENT_TYPE',
  AMOUNT = 'AMOUNT',
  CREATED_AT = 'CREATED_AT',
}

export class PayoutService extends BaseGraphqlService {
  getPayouts(
    variables: GraphqlVariables & {
      customerId?: number;
      filters?: AppliedFilterState;
    },
  ) {
    return this.graphql<CustomerPayoutsResponse>(
      `
      query getCustomerPayouts($offset: Int, $limit: Int, $customerId: ID, $businessUnitId: ID, $sortBy: PayoutSorting, $sortOrder: SortOrder, $filters: PayoutFilters, $query: String) {
          payouts(offset: $offset, limit: $limit, customerId: $customerId, businessUnitId: $businessUnitId, sortBy: $sortBy, sortOrder: $sortOrder, filters: $filters, query: $query) {
            ${PayoutFragment}
          }
      }
    `,
      variables,
    );
  }

  getDetailedById(id: number) {
    return this.graphql<CustomerPayoutResponse>(
      `
      query getCustomerDetailedPayout($id: ID!) {
          payout(id: $id) {
            ${DetailedPayoutFragment}
          }
      }
    `,
      {
        id,
      },
    );
  }

  async createPayout(customerId: number, data: CreatePayoutPayload) {
    const result = await this.graphql<PayoutResponse>(
      `
      mutation Payout(
        $customerId: ID!
        $data: PayoutInput!
      ) {
        createPayout(customerId: $customerId, data: $data) {
          ${DetailedPayoutFragment}
        }
      }
      `,
      {
        customerId,
        data: omit(
          {
            ...data,
            paymentType: PaymentTypeEnum[data.paymentType],
          },
          ['amount'],
        ),
      },
    );

    return result.createPayout;
  }
}
