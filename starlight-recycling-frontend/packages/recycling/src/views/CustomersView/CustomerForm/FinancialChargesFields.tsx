import React, { memo } from 'react';
import { Field } from 'react-final-form';

import { CheckBoxField, TextField, SelectOption } from '@starlightpro/common';
import { Trans } from '../../../i18n';
import Box from '@material-ui/core/Box';

import { AprType } from '../../../graphql/api';
import { AprChargeField } from './AprChargeField';

export interface FinancialChargesFieldsProps {
  classes: {
    dividerMargin: string;
    aprTypeField: string;
    taxInfo: string;
  };
  addFinancialCharges: boolean;
}

const AprTypeOptions = [AprType.Standard, AprType.Custom].map((type) => (
  <SelectOption key={type} value={type}>
    <Trans>{'AprType-' + type}</Trans>
  </SelectOption>
));

export const FinancialChargesFields = memo<FinancialChargesFieldsProps>(
  ({ classes, addFinancialCharges }) => {
    return (
      <>
        <CheckBoxField name="addFinancialCharges" label={<Trans>Add Financial Charges</Trans>} />
        <Box display="flex" mb={3} alignItems="flex-end">
          <TextField
            select
            name="apr"
            className={classes.aprTypeField}
            required={addFinancialCharges}
            disabled={!addFinancialCharges}
            fullWidth
          >
            {AprTypeOptions}
          </TextField>
          <div className={classes.dividerMargin} />
          <Field name="apr" subscription={{ value: true }}>
            {({ input: { value: aprType } }) => (
              <AprChargeField
                required={addFinancialCharges && aprType === AprType.Custom}
                disabled={!addFinancialCharges || aprType === AprType.Standard}
              />
            )}
          </Field>
          <div className={classes.dividerMargin} />
        </Box>
      </>
    );
  },
);
