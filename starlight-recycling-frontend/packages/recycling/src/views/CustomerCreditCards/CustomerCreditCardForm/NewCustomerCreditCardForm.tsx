import React, { FC, useMemo } from 'react';
import { gql } from '@apollo/client';

import CustomerCreditCardForm from './CustomerCreditCardForm';
import {
  useAddCreditCardMutation,
  AddCreditCardMutationResult,
  useFetchCustomerAddressQuery,
  AddCreditCardInput,
} from '../../../graphql/api';
import { showError } from '@starlightpro/common';
import { omit } from 'lodash-es';

gql`
  mutation addCreditCard($customerId: Int!, $data: AddCreditCardInput!) {
    createCreditCard(customerId: $customerId, data: $data) {
      id
    }
  }
  query fetchCustomerAddress($id: Int!) {
    haulingCustomer(id: $id) {
      type
      billingAddress {
        addressLine1
        addressLine2
        city
        state
        zip
      }
    }
  }
`;

export interface NewCustomerCreditCardFormProps {
  customerId: number;
  onSubmitted?: (values: any, creditCardId?: string) => void;
  onCancel(): void;
}

export const NewCustomerCreditCardForm: FC<NewCustomerCreditCardFormProps> = ({
  customerId,
  onSubmitted,
  onCancel,
}) => {
  const [addCreditCard] = useAddCreditCardMutation();

  const { data } = useFetchCustomerAddressQuery({ variables: { id: customerId } });

  const initialValues = useMemo(
    () => ({
      active: true,
      nameOnCard: '',
      isValidFor: 'all',
      selectedJobSites: [],
      customerType: data?.haulingCustomer?.type,
      ...data?.haulingCustomer?.billingAddress,
    }),
    [data],
  );

  return (
    <CustomerCreditCardForm
      customerId={customerId}
      create
      initialValues={initialValues}
      onSubmit={async (values) => {
        try {
          return await addCreditCard({
            variables: {
              customerId,
              data: {
                ...omit(values, 'customerType'),
                cardNumber: values.cardNumber.replace(/ /g, '').trim(),
              } as AddCreditCardInput,
            },
          });
        } catch (e) {
          showError(e.message);
          throw e;
        }
      }}
      onSubmitted={(values, result: AddCreditCardMutationResult) => {
        if (onSubmitted) {
          onSubmitted(values, result.data?.createCreditCard?.id);
        }
      }}
      onCancel={onCancel}
    />
  );
};

export default NewCustomerCreditCardForm;
