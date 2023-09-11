import React, { FC } from 'react';

import CustomerTruckForm from './CustomerTruckForm';
import { gql } from '@apollo/client';
import {
  AddCustomerTruckMutation,
  CustomerTruckInput,
  useAddCustomerTruckMutation,
} from '../../../graphql/api';
import { showError, showSuccess } from '@starlightpro/common';
import { Trans } from '../../../i18n';

export const ADD_CUSTOMER_TRUCK = gql`
  mutation AddCustomerTruck($data: CustomerTruckInput!) {
    createCustomerTruck(data: $data) {
      id
      description
      truckNumber
      type
      emptyWeight
    }
  }
`;

const initialValues = {
  active: true,
  description: '',
  truckNumber: '',
};

export interface NewTruckFormProps {
  customerId: number;
  onSubmitted?: (result?: AddCustomerTruckMutation['createCustomerTruck']) => Promise<any>;
  onCancel?: () => void;
  hideStatus?: boolean;
}

export const NewTruckForm: FC<NewTruckFormProps> = ({
  customerId,
  onSubmitted,
  onCancel,
  hideStatus,
}) => {
  const [createTruck] = useAddCustomerTruckMutation();

  const handleSubmit = async (values: any) => {
    try {
      const truck = await createTruck({
        variables: {
          data: {
            ...values,
            customerId,
            emptyWeight: values.emptyWeight,
          } as CustomerTruckInput,
        },
        refetchQueries: ['getCustomerTrucks'],
      });

      showSuccess(<Trans>Truck created successfully.</Trans>);

      return truck;
    } catch (e) {
      showError(<Trans>Could not create Truck.</Trans>);
    }
  };

  return (
    <CustomerTruckForm
      hideStatus={hideStatus}
      create
      initialValues={initialValues}
      onSubmitted={(values, result?: AddCustomerTruckMutation) => {
        if (onSubmitted) {
          onSubmitted(result?.createCustomerTruck);
        }
      }}
      onSubmit={handleSubmit}
      onCancel={onCancel}
    />
  );
};

export default NewTruckForm;
