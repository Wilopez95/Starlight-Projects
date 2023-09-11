import React, { FC } from 'react';
import { TextField } from '@starlightpro/common';
import Box from '@material-ui/core/Box';
import { useTranslation } from '../../../../i18n';
import { makeStyles } from '@material-ui/core/styles';

import { FilterInputProps } from '../../../Filter/Filter';

const useStyles = makeStyles(({ spacing }) => ({
  root: {},
  field: {
    display: 'inline-flex',
    width: 260,
  },
  input: {
    margin: 0,
  },
  midLine: {
    margin: spacing(1, 2, 0, 2),
  },
}));

export type BalanceRangeValue = {
  from?: number;
  to?: number;
};

export const RangeField: FC<FilterInputProps> = ({ name, min, max }: any) => {
  const classes = useStyles();
  const [t] = useTranslation();

  return (
    <Box className={classes.root}>
      <Box display="inline-flex">
        <TextField
          name={`${name}.value.from`}
          data-cy="Range Field From"
          placeholder={t('From')}
          type="number"
          inputProps={{ max: min, step: 'any' }}
          touched
        />
        <Box className={classes.midLine}>&#8212;</Box>
        <TextField
          name={`${name}.value.to`}
          data-cy="Range Field To"
          placeholder={t('To')}
          type="number"
          inputProps={{ min: max, step: 'any' }}
          touched
        />
      </Box>
    </Box>
  );
};

export default RangeField;
