import React, { FC } from 'react';
import { Field } from 'react-final-form';
import { Box, makeStyles } from '@material-ui/core';
import DateField from '../../../FinalForm/DateField';
import { DatatableFilterDisplayProps } from '../../types';
import { useTranslation } from '../../../../i18n';

const useStyles = makeStyles(
  ({ spacing }) => ({
    midLine: {
      margin: spacing(1, 2, 0, 2),
    },
    dateField: {
      marginBottom: 0,
    },
  }),
  { name: 'FilterDateRange' },
);

export const DateRangeField: FC<DatatableFilterDisplayProps> = ({ name }) => {
  const [t] = useTranslation();
  const classes = useStyles();

  const to = `${name}.value.to`;
  const from = `${name}.value.from`;

  return (
    <Box display="flex">
      <Field name={to} subscription={{ value: true }}>
        {({ input: { value } }) => (
          <DateField
            placeholder={t('From')}
            className={classes.dateField}
            maxDate={value}
            name={from}
            data-cy="From"
          />
        )}
      </Field>
      <Box className={classes.midLine}>&#8212;</Box>
      <Field name={from} subscription={{ value: true }}>
        {({ input: { value } }) => (
          <DateField
            placeholder={t('To')}
            className={classes.dateField}
            minDate={value}
            name={to}
            data-cy="To"
          />
        )}
      </Field>
    </Box>
  );
};
