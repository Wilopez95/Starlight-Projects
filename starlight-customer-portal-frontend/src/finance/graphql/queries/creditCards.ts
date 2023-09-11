import { omit } from 'lodash-es';

import { RequestQueryParams } from '@root/core/api/base';
import { ICreditCard } from '@root/core/types';
import {
  CreditCardAddedResponse,
  CreditCardByIdResponse,
  CreditCardsResponse,
  CreditCardUpdatedResponse,
} from '@root/finance/api/creditCard/types';
import { billingHttpClient } from '@root/finance/api/httpClient';
import { CreditCardFragment } from '@root/finance/graphql/fragments';

export const create = (customerId: number, data: Partial<ICreditCard>) =>
  billingHttpClient.graphql<CreditCardAddedResponse>(
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

export const update = (id: number, data: Partial<ICreditCard>) =>
  billingHttpClient.graphql<CreditCardUpdatedResponse>(
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
      ]),
    },
  );

export const getById = (id: string) =>
  billingHttpClient.graphql<CreditCardByIdResponse>(
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

export const getOneByCustomerId = (customerId: number, options: RequestQueryParams = {}) => {
  const { jobSiteId, activeOnly, relevantOnly } = options;

  return billingHttpClient.graphql<CreditCardsResponse>(
    `
      query getCreditCards(
          $customerId: ID!
          $activeOnly: Boolean = false
          $jobSiteId: ID
          $relevantOnly: Boolean = false
        ) {
        creditCards(
          customerId: $customerId,
          activeOnly: $activeOnly,
          jobSiteId: $jobSiteId,
          relevantOnly: $relevantOnly
          ) {
            ${CreditCardFragment}
          }
      }
    `,
    {
      customerId,
      jobSiteId,
      activeOnly,
      relevantOnly,
    },
  );
};
