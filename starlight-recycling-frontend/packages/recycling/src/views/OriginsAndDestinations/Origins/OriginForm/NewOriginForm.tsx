import React, { FC } from 'react';
import { gql } from '@apollo/client';

import OriginForm from './OriginForm';
import { HaulingOrigin, useAddOriginMutation } from '../../../../graphql/api';
import { showSuccess } from '@starlightpro/common';
import { Trans } from '../../../../i18n';

export const ADD_ORIGIN = gql`
  mutation AddOrigin($data: OriginInput!) {
    createOrigin(data: $data) {
      id
    }
  }
`;

export interface NewOriginFormProps {
  origin: HaulingOrigin | null;
  onSubmitted?: () => void;
}

export const NewOriginForm: FC<NewOriginFormProps> = ({ origin, onSubmitted }) => {
  const [addNewOrigin] = useAddOriginMutation();

  return (
    <OriginForm
      create
      origin={origin}
      onSubmit={async (values) => {
        await addNewOrigin({
          variables: {
            data: {
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

        showSuccess(<Trans>Origin created successfully.</Trans>);
      }}
      onSubmitted={onSubmitted}
    />
  );
};
