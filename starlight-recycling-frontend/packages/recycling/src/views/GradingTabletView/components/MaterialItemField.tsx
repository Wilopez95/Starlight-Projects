import React, { FC, memo } from 'react';
import { useField } from 'react-final-form';
import { Box, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { SliderField } from './SliderField';
import { CounterField } from './CounterField';
import { GradingControlFieldProps } from '../types';

const MIN_VALUE = 0;
const STEP = 5;

const useStyles = makeStyles(({ spacing }) => ({
  root: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing(2),
  },
  materialName: {
    wordBreak: 'break-all',
    paddingRight: spacing(2),
  },
}));

export const MaterialItemField: FC<GradingControlFieldProps & { max?: number }> = memo(
  ({ name, max }) => {
    const classes = useStyles();
    const {
      input: { value: description },
    } = useField(`${name}.material.description`, { subscription: { value: true } });

    return (
      <Box className={classes.root}>
        <Box width="14rem">
          <Typography className={classes.materialName} variant="body1">
            {description}
          </Typography>
        </Box>
        <Box flexGrow={1}>
          <SliderField name={`${name}.value`} step={STEP} min={MIN_VALUE} max={max} />
        </Box>
        <Box width="25rem">
          <CounterField
            name={`${name}.value`}
            min={MIN_VALUE}
            max={max}
            description={description}
          />
        </Box>
      </Box>
    );
  },
);
