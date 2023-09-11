import { Box, makeStyles, Typography } from '@material-ui/core';
import React, { FC } from 'react';
import { FormattedTax } from './helpers';

const useStyles = makeStyles(
  ({ palette }) => ({
    root: {
      maxWidth: 400,
      wordBreak: 'break-word',
    },
    description: {},
    quantityText: {
      color: palette.grey['600'],
    },
  }),
  { name: 'TaxDescription' },
);

export interface TaxDescriptionProps {
  calculatedTax: FormattedTax;
  serviceName?: string;
  unit?: string;
}

export const TaxDescription: FC<TaxDescriptionProps> = ({ serviceName, calculatedTax, unit }) => {
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      <Typography variant="body2" className={classes.description}>
        <b>{calculatedTax.description}</b>
      </Typography>
      {calculatedTax.basedOn && (
        <Typography variant="body2" className={classes.quantityText}>
          <span>
            <b>{serviceName}</b>: {calculatedTax.basedOn} {unit}
          </span>
        </Typography>
      )}
    </Box>
  );
};
