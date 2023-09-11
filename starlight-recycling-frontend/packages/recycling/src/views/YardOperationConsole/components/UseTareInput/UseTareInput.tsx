import React, { FC } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import { ReadOnlyOrderFormComponent } from '../../types';
import { Trans } from '../../../../i18n';
import { CheckBoxField } from '@starlightpro/common';
import { useField } from 'react-final-form';
import { CustomerOption } from '../../../../components/FinalForm/CustomerSearchField';
import { CustomerType } from '../../../../graphql/api';

const useStyles = makeStyles(
  () => ({
    root: {
      marginRight: 0,
    },
  }),
  { name: 'UseTareInput' },
);

export interface UseTareInputProps extends ReadOnlyOrderFormComponent {}

export const UseTareInput: FC<UseTareInputProps> = ({ readOnly }) => {
  const classes = useStyles();
  const {
    input: { value },
  } = useField<CustomerOption['customer']>('customer', { subscription: { value: true } });

  if (value.type === CustomerType.Walkup) {
    return null;
  }

  return (
    <CheckBoxField
      classes={{ formControlRoot: classes.root }}
      disabled={readOnly}
      label={<Trans>Use Tare</Trans>}
      name="useTare"
    />
  );
};

export default UseTareInput;
