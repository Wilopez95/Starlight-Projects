import React, { FC } from 'react';
import { gql } from '@apollo/client';

import DestinationForm from './DestinationForm';
import { HaulingDestination } from '../../../../graphql/api';
import { useAddDestinationMutation } from '../../../../graphql/api';
import { showSuccess } from '@starlightpro/common';
import { Trans } from '../../../../i18n';

export const ADD_DESTINATION = gql`
  mutation AddDestination($data: HaulingDestinationInput!) {
    createDestination(data: $data) {
      id
    }
  }
`;

export interface NewDestinationFormProps {
  destination: HaulingDestination | null;
  onSubmitted: () => void;
}

export const NewDestinationForm: FC<NewDestinationFormProps> = ({ destination, onSubmitted }) => {
  const [addNewDestination] = useAddDestinationMutation();

  return (
    <DestinationForm
      create
      destination={destination}
      onSubmit={async (values: any) => {
        await addNewDestination({
          variables: {
            data: values,
          },
        });

        showSuccess(<Trans>Destination created successfully.</Trans>);
      }}
      onSubmitted={onSubmitted}
    />
  );
};
