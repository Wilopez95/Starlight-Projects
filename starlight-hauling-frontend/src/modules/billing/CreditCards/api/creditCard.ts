import { omit } from 'lodash-es';

import { BaseGraphqlService, RequestQueryParams } from '../../../../api/base';
import { parseDate, substituteLocalTimeZoneInsteadUTC } from '../../../../helpers';
import { JsonConversions } from '../../../../types';
import { ICreditCard } from '../types';

import { CreditCardFragment } from './fragments';
import {
  CreditCardAddedResponse,
  CreditCardByIdResponse,
  CreditCardsResponse,
  CreditCardUpdatedResponse,
  ICreditCardExtended,
  JobSiteItem,
} from './types';

const mapCreditCardResult = (cc: JsonConversions<ICreditCardExtended>): ICreditCard => ({
  ...cc,
  id: Number(cc.id),
  jobSites: cc.jobSites?.map(({ id }: JobSiteItem) => Number.parseInt(id, 10)) ?? null,
  expDate: substituteLocalTimeZoneInsteadUTC(cc.expDate),
  createdAt: parseDate(cc.createdAt),
  updatedAt: parseDate(cc.updatedAt),
});

export class CreditCardService extends BaseGraphqlService {
  async get(customerId: number, options: RequestQueryParams = {}) {
    const result = await this.graphql<CreditCardsResponse>(
      `
      query getCreditCards(
          $customerId: ID!
          $activeOnly: Boolean = false
          $jobSiteId: ID
          $relevantOnly: Boolean = false
          $isAutopay: Boolean
          $sortBy: CcSorting
          $sortOrder: SortOrder
        ) {
        creditCards(
          customerId: $customerId,
          activeOnly: $activeOnly,
          jobSiteId: $jobSiteId,
          relevantOnly: $relevantOnly,
          isAutopay: $isAutopay,
          sortBy: $sortBy,
          sortOrder: $sortOrder
          ) {
            ${CreditCardFragment}
          }
      }
    `,
      {
        ...options,
        customerId,
      },
    );

    return result.creditCards.map(mapCreditCardResult);
  }

  async getById(id: string) {
    const result = await this.graphql<CreditCardByIdResponse>(
      `
      query getCreditCard($id: ID!) {
        creditCard(id: $id) {
            ${CreditCardFragment}
          }
      }
    `,
      {
        id,
      },
    );

    return mapCreditCardResult(result.creditCard);
  }

  async create(customerId: number, data: Partial<ICreditCard>) {
    const result = await this.graphql<CreditCardAddedResponse>(
      `
      mutation NewCreditCard(
        $customerId: ID!
        $data: AddCreditCardInput!
      ) {
        addCreditCard(customerId: $customerId, data: $data) {
          ${CreditCardFragment}
        }
      }
      `,
      {
        customerId,
        data: omit(data, ['id', 'customerId']),
      },
    );

    return result.addCreditCard;
  }

  async patch(id: number, data: Partial<ICreditCard>) {
    const result = await this.graphql<CreditCardUpdatedResponse>(
      `
      mutation UpdateCreditCard(
        $id: ID!
        $data: EditCreditCardInput!
      ) {
        updateCreditCard(id: $id, data: $data) {
          ${CreditCardFragment}
        }
      }
      `,
      {
        id,
        data: omit(data, [
          'id',
          'customerId',
          'cardType',
          'expirationMonth',
          'expirationYear',
          'expDate',
          'cardNumberLastDigits',
          'spUsed',
        ]),
      },
    );

    return result.updateCreditCard;
  }
}
