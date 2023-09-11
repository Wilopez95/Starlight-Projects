import React, { FC } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import { ReadOnlyOrderFormComponent } from '../../types';
import { Field, useField } from 'react-final-form';
import Box from '@material-ui/core/Box';
import { useTranslation } from '../../../../i18n';
import { TextField } from '@starlightpro/common';
import { useCompanyMeasurementUnits } from '../../../../hooks/useCompanyMeasurementUnits';
import { GetOrderQuery } from '../../../../graphql/api';

const useStyles = makeStyles(({ spacing }) => ({
  root: {
    display: 'flex',
  },
  field: {
    marginBottom: spacing(4),
  },
  weightFormControlInner: {
    width: 170,
    marginRight: spacing(2),
  },
  inputBaseRoot: {
    width: 76,
  },
}));

export interface TareInputsProps extends ReadOnlyOrderFormComponent {}

export const TareInputs: FC<TareInputsProps> = ({ readOnly }) => {
  const classes = useStyles();
  const {
    input: { value: containerId },
  } = useField('containerId', { subscription: { value: true } });
  const { t } = useTranslation();
  const { massTranslation } = useCompanyMeasurementUnits();

  return (
    <Box className={classes.root}>
      <TextField
        disabled={readOnly}
        id="truckTare"
        name="truckTare"
        label={`${t('Truck Tare')} (${massTranslation})`}
        type="number"
        inputProps={{ min: 0 }}
        required
        classes={{
          root: classes.field,
          formControlInner: classes.weightFormControlInner,
          inputBaseRoot: classes.inputBaseRoot,
        }}
      />
      {containerId && (
        <Field<GetOrderQuery['order']['customer']> name="customer" subscription={{ value: true }}>
          {({ input: { value: customer } }) => (
            <TextField
              disabled={readOnly}
              id="canTare"
              name="canTare"
              label={`${t('Can Tare')} (${massTranslation})`}
              type="number"
              inputProps={{ min: 0 }}
              required={!!customer?.canTareWeightRequired}
              classes={{
                root: classes.field,
                formControlInner: classes.weightFormControlInner,
                inputBaseRoot: classes.inputBaseRoot,
              }}
            />
          )}
        </Field>
      )}
    </Box>
  );
};

export default TareInputs;
