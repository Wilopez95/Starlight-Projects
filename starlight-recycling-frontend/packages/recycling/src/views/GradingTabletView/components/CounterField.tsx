import React, { FC, memo } from 'react';
import { Field } from 'react-final-form';
import { Box, IconButton } from '@material-ui/core';
import RemoveIcon from '@material-ui/icons/Remove';
import { TextField } from '@starlightpro/common';
import AddIcon from '@material-ui/icons/Add';
import { makeStyles } from '@material-ui/core/styles';
import { useTranslation } from '../../../i18n';

interface Props {
  name: string;
  min?: number;
  max?: number;
  description: string;
}

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: '2em',
  },
  input: {
    marginBottom: 0,
    maxWidth: '6rem',
    '& input': {
      textAlign: 'center',
    },
  },
}));

export const CounterField: FC<Props> = memo(({ name, min = 0, max, description }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <Box className={classes.root}>
      <Field name={name} subscription={{ value: true }}>
        {({ input: { value, onChange, onBlur } }) => (
          <IconButton
            disabled={value <= min}
            onClick={() => {
              onChange(value - 1);
              onBlur();
            }}
            color="primary"
            aria-label={t('Decrement', { description })}
          >
            <RemoveIcon />
          </IconButton>
        )}
      </Field>

      <TextField hideArrows hideErrorText className={classes.input} type="number" name={name} />
      <Field name={name} subscription={{ value: true }}>
        {({ input: { value, onChange, onBlur } }) => (
          <IconButton
            disabled={max != null && value >= max}
            onClick={() => {
              onChange(value + 1);
              onBlur();
            }}
            color="primary"
            aria-label={t('Increment', { description })}
          >
            <AddIcon />
          </IconButton>
        )}
      </Field>
    </Box>
  );
});
