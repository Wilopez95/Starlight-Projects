import React, { FC, memo } from 'react';
import { Box, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { CounterField } from './CounterField';
import { GradingControlFieldProps } from '../types';
import { useField } from 'react-final-form';

const MIN_VALUE = 0;

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

export const MiscellaneousItemField: FC<GradingControlFieldProps> = memo(({ name }) => {
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
      <Box flexGrow={1} />
      <Box width="25rem">
        <CounterField name={`${name}.quantity`} min={MIN_VALUE} description={description} />
      </Box>
    </Box>
  );
});
