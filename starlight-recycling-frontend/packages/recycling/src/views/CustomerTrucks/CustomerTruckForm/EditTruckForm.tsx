import React, { FC } from 'react';

import CustomerTruckForm from './CustomerTruckForm';
import {
  CustomerTruck,
  CustomerTruckUpdateInput,
  useUpdateCustomerTruckMutation,
} from '../../../graphql/api';
import { gql } from '@apollo/client';
import { omit } from 'lodash-es';
import {
  MeasureTarget,
  useCompanyMeasurementUnits,
} from '../../../hooks/useCompanyMeasurementUnits';

export const UPDATE_CUSTOMER_TRUCK = gql`
  mutation UpdateCustomerTruck($data: CustomerTruckUpdateInput!) {
    updateCustomerTruck(data: $data) {
      id
    }
  }
`;

export interface TruckPart
  extends Pick<
    CustomerTruck,
    'id' | 'active' | 'description' | 'type' | 'truckNumber' | 'licensePlate' | 'emptyWeight'
  > {}

export interface EditTruckFormProps {
  customerId: number;
  truck: TruckPart;
  onCancel?(): void;
  onSubmitted?(): Promise<any>;
}

export const EditTruckForm: FC<EditTruckFormProps> = ({
  customerId,
  truck,
  onSubmitted,
  onCancel,
}) => {
  const [updateTruck] = useUpdateCustomerTruckMutation();
  const { id, ...initialValues } = truck;
  const { convertWeights } = useCompanyMeasurementUnits();

  return (
    <CustomerTruckForm
      initialValues={omit(initialValues, '__typename', 'highlight')}
      onSubmit={async (data) => {
        await updateTruck({
          variables: {
            data: convertWeights(
              {
                ...data,
                id,
                customerId,
                licensePlate: data.licensePlate || null,
              },
              MeasureTarget.backend,
            ) as CustomerTruckUpdateInput,
          },
          refetchQueries: ['getCustomerTrucks'],
        });
      }}
      onSubmitted={onSubmitted}
      onCancel={onCancel}
    />
  );
};

export default EditTruckForm;
