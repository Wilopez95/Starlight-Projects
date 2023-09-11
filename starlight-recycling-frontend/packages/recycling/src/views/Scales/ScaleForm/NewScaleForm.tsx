import React, { FC } from 'react';
import { gql } from '@apollo/client';

import { ScaleForm, ScaleFormValues } from './ScaleForm';
import { ScaleConnectionStatus, useAddScaleMutation } from '../../../graphql/api';

gql`
  mutation addScale($data: ScaleInput!) {
    createScale(data: $data) {
      id
    }
  }
`;

const initialValues = {
  name: '',
  connectionStatus: ScaleConnectionStatus.PendingConnection,
};

export interface NewScaleFormProps {
  onSubmitted?(): Promise<void>;
}

export const NewScaleForm: FC<NewScaleFormProps> = ({ onSubmitted }) => {
  const [addScale] = useAddScaleMutation();

  const onSubmit = async ({ scale, ...values }: ScaleFormValues) => {
    await addScale({
      variables: {
        data: { ...values, deviceName: scale?.deviceName, deviceNumber: scale?.deviceNum },
      },
      refetchQueries: ['getScales'],
    });
  };

  return (
    <ScaleForm create initialValues={initialValues} onSubmit={onSubmit} onSubmitted={onSubmitted} />
  );
};
