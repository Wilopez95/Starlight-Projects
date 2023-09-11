import React from 'react';
import { TextField } from '@starlightpro/common';
import { Trans } from '../../../i18n';
import { useField } from 'react-final-form';
import { ReadOnlyOrderFormComponent } from '../types';
import { CustomerType } from '../../../graphql/api';
interface Props extends ReadOnlyOrderFormComponent {}

export const LicensePlateInput: React.FC<Props> = ({ readOnly }) => {
  const {
    input: { value: customer },
  } = useField('customer', { subscription: { value: true } });

  return (
    <TextField
      id="licensePlate"
      name="licensePlate"
      label={<Trans>Plate Number</Trans>}
      disabled={readOnly || !customer || customer.type !== CustomerType.Walkup}
      required={customer.type === CustomerType.Walkup}
      fullWidth
    />
  );
};
