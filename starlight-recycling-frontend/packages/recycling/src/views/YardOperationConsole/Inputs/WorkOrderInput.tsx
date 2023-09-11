import React from 'react';
import { TextField } from '@starlightpro/common';
import { Trans } from '../../../i18n';
import { useField } from 'react-final-form';
import { ReadOnlyOrderFormComponent } from '../types';
import { CustomerType } from '../../../graphql/api';

interface Props extends ReadOnlyOrderFormComponent {}

export const WorkOrderInput: React.FC<Props> = ({ readOnly }) => {
  const {
    input: { value: customer },
  } = useField('customer', { subscription: { value: true } });

  return (
    <TextField
      id="WONumber"
      name="WONumber"
      label={<Trans>WO#</Trans>}
      disabled={readOnly || !customer || customer.type === CustomerType.Walkup}
      required={customer?.workOrderRequired}
      fullWidth
    />
  );
};
