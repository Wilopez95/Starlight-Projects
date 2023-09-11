import React, { FC } from 'react';
import { gql } from '@apollo/client';
import CircularProgress from '@material-ui/core/CircularProgress';

import DestinationForm from './DestinationForm';
import { useGetDestinationQuery, useUpdateDestinationMutation } from '../../../../graphql/api';
import { showSuccess } from '@starlightpro/common';
import { Trans } from '../../../../i18n';

export const GET_DESTINATION = gql`
  query getDestination($id: Int!) {
    destination(id: $id) {
      id
      description
      active
      addressLine1
      addressLine2
      state
      city
      zip
      geojson
    }
  }
`;

export const UPDATE_DESTINATION = gql`
  mutation UpdateDestination($data: HaulingDestinationUpdateInput!) {
    updateDestination(data: $data) {
      id
    }
  }
`;

export interface EditDestinationFormProps {
  destinationId: number;
  onSubmitted: () => void;
}

export const EditDestinationForm: FC<EditDestinationFormProps> = ({
  destinationId,
  onSubmitted,
}) => {
  const [updateDestination] = useUpdateDestinationMutation();
  const { data, loading } = useGetDestinationQuery({
    variables: {
      id: destinationId,
    },
    fetchPolicy: 'network-only',
  });
  const destination = data?.destination;

  if (!destination || loading) {
    return <CircularProgress size={40} />;
  }

  return (
    <DestinationForm
      destination={destination}
      onSubmit={async (values: any) => {
        await updateDestination({
          variables: {
            data: values,
          },
        });

        showSuccess(<Trans>Destination updated successfully.</Trans>);
      }}
      onSubmitted={onSubmitted}
    />
  );
};
