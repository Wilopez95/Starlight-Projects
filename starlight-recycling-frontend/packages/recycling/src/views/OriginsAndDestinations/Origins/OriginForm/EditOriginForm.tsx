import React, { FC } from 'react';
import { gql } from '@apollo/client';
import CircularProgress from '@material-ui/core/CircularProgress';

import OriginForm from './OriginForm';
import { useGetOriginQuery, useUpdateOriginMutation } from '../../../../graphql/api';
import { showSuccess } from '@starlightpro/common';
import { Trans } from '../../../../i18n';

gql`
  query getOrigin($id: Int!) {
    origin(id: $id) {
      id
      active
      description
      originDistricts {
        county
        city
        state
        taxDistrictId
      }
    }
  }
`;

gql`
  mutation UpdateOrigin($data: OriginUpdateInput!) {
    updateOrigin(data: $data) {
      id
    }
  }
`;

export interface EditOriginFormProps {
  originId: number;
  onSubmitted?: () => void;
}

export const EditOriginForm: FC<EditOriginFormProps> = ({ originId, onSubmitted }) => {
  const [updateOrigin] = useUpdateOriginMutation();
  const { data, loading } = useGetOriginQuery({
    variables: {
      id: originId,
    },
    fetchPolicy: 'network-only',
  });
  const origin = data?.origin;

  if (!origin || loading) {
    return <CircularProgress size={40} />;
  }

  return (
    <OriginForm
      origin={origin}
      onSubmit={async (values) => {
        await updateOrigin({
          variables: {
            data: {
              id: originId,
              active: values.active,
              description: values.description,
              originDistricts: values.originDistricts.map(
                ({ city, state, county, taxDistrictId }) => ({
                  city,
                  state,
                  county,
                  taxDistrictId,
                }),
              ),
            },
          },
        });
        showSuccess(<Trans>Origin updated successfully.</Trans>);
      }}
      onSubmitted={onSubmitted}
    />
  );
};
