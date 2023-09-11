import React, { useEffect, useMemo } from 'react';
import { truncate } from 'lodash/fp';
import { Trans } from '../../../i18n';
import { useField } from 'react-final-form';
import { SelectOption, TextField } from '@starlightpro/common';
import {
  CreditCard,
  CustomerType,
  GetCreditCardsQueryVariables,
  useGetCreditCardLazyQuery,
  useGetCreditCardsLazyQuery,
  useLastUsedCreditCardLazyQuery,
} from '../../../graphql/api';
import { ReadOnlyOrderFormComponent } from '../types';
import { gql } from '@apollo/client';
import { CustomerOption } from '../../../components/FinalForm/CustomerSearchField';

interface Props extends ReadOnlyOrderFormComponent {}

gql`
  query getCreditCards($filter: CreditCardFilter!) {
    creditCards(filter: $filter) {
      id
      active
      cardNickname
      cardType
      expirationDate
      cardNumberLastDigits
    }
  }
  query getCreditCard($id: ID!) {
    creditCard(id: $id) {
      id
      active
      cardNickname
      cardNumberLastDigits
      expirationDate
      nameOnCard
      addressLine1
      addressLine2
      city
      state
      zip
    }
  }
  query lastUsedCreditCard($customerId: Int!, $jobSiteId: Int) {
    lastUsedCreditCard(customerId: $customerId, jobSiteId: $jobSiteId)
  }
`;

export const CustomerCreditCardInput: React.FC<Props> = ({ readOnly }) => {
  const {
    input: { value: customer },
  } = useField<CustomerOption['customer']>('customer', { subscription: { value: true } });
  const {
    input: { value: customerJobSite },
  } = useField('jobSite', { subscription: { value: true } });
  const {
    input: { value: creditCardId, onChange },
  } = useField('creditCardId', { subscription: { value: true } });

  const [getCreditCards, { data: creditCards }] = useGetCreditCardsLazyQuery({
    fetchPolicy: 'network-only',
  });
  const [getCreditCard, { data: creditCard }] = useGetCreditCardLazyQuery();
  const [
    getLastUsedCreditCard,
    { data: lastUsedCreditCardData },
  ] = useLastUsedCreditCardLazyQuery();

  useEffect(() => {
    if (lastUsedCreditCardData?.lastUsedCreditCard && !creditCardId) {
      onChange({
        target: {
          name: 'creditCardId',
          value: lastUsedCreditCardData.lastUsedCreditCard,
        },
      });
    }
  }, [creditCardId, lastUsedCreditCardData, onChange]);

  useEffect(() => {
    const variables: GetCreditCardsQueryVariables = {
      filter: {},
    };

    if (customer?.id) {
      variables.filter.customerId = customer.id;
    }

    if (customerJobSite?.id) {
      variables.filter.jobSiteId = customerJobSite.id;
    }

    if (!customer?.id) {
      return;
    }

    if (customer.type === CustomerType.Walkup) {
      if (creditCardId) {
        getCreditCard({ variables: { id: creditCardId } });
      }

      return;
    }

    if (!creditCardId && customer) {
      getLastUsedCreditCard({
        variables: {
          customerId: customer.id,
          jobSiteId: customerJobSite?.id ?? null,
        },
      });
    }
    getCreditCards({
      variables,
    });
  }, [
    customer,
    customerJobSite,
    getCreditCards,
    creditCardId,
    getCreditCard,
    getLastUsedCreditCard,
  ]);

  const options = useMemo<
    Pick<CreditCard, 'id' | 'cardNickname' | 'cardNumberLastDigits'>[]
  >(() => {
    if (customer.type === CustomerType.Walkup) {
      if (!creditCard?.creditCard) {
        return [];
      }

      return [creditCard.creditCard];
    }

    return creditCards?.creditCards || [];
  }, [creditCard, creditCards?.creditCards, customer.type]);

  return (
    <TextField
      disabled={readOnly}
      select
      name="creditCardId"
      fullWidth
      label={<Trans>Credit Card</Trans>}
    >
      {options.map((creditCard) => (
        <SelectOption key={creditCard.id} value={creditCard.id}>
          {truncate({ length: 26 }, creditCard.cardNickname || '')}
          (.... .... .... {creditCard.cardNumberLastDigits})
        </SelectOption>
      ))}
    </TextField>
  );
};
