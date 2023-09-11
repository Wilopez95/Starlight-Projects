import React, { memo, useEffect } from 'react';
import { Trans } from '../../../i18n';
import { useField } from 'react-final-form';
import { gql } from '@apollo/client';
import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import { TextField } from '@starlightpro/common';
import isNumber from 'lodash/isNumber';
import { useGetStandartAprLazyQuery, AprType } from '../../../graphql/api';

export interface AprChargeFieldProps {
  required?: boolean;
  disabled?: boolean;
}

export const GET_STANDART_APR_CHARGE = gql`
  query getStandartApr {
    company {
      financeAPR
    }
  }
`;

export const AprChargeField = memo<AprChargeFieldProps>(({ required, disabled }) => {
  const { input: aprTypeInput } = useField('aprType', { subscription: { value: true } });
  const { input: aprChargeInput } = useField('aprCharge', { subscription: {} });
  const [getStandartApr, { data, loading, called }] = useGetStandartAprLazyQuery({
    fetchPolicy: 'network-only',
  });
  const aprType = aprTypeInput.value;
  const aprCharge = aprChargeInput.value;
  const standartApr = data?.company.financeAPR || 0;

  useEffect(() => {
    if (aprType !== AprType.Standard) {
      return;
    }

    if (called) {
      return;
    }

    getStandartApr();
  }, [aprType, called, getStandartApr]);

  useEffect(() => {
    if (!isNumber(standartApr) || loading) {
      return;
    }

    if (aprType !== AprType.Standard) {
      return;
    }

    if (aprCharge === standartApr) {
      return;
    }

    aprChargeInput.onChange({
      target: {
        name: 'aprCharge',
        value: standartApr,
      },
    });
  }, [aprCharge, aprChargeInput, aprType, loading, standartApr]);

  if (aprType === AprType.Standard) {
    if (!isNumber(standartApr) || loading) {
      return (
        <Box display="flex" alignItems="center">
          <CircularProgress size={30} />
        </Box>
      );
    }
  }

  return (
    <TextField
      type="number"
      name="aprCharge"
      label={<Trans>Charge %</Trans>}
      required={required}
      disabled={disabled}
      InputProps={{
        inputProps: {
          step: '0.01',
        },
      }}
    />
  );
});
