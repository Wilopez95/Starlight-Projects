import { Typography } from '@material-ui/core';
import React, { FC } from 'react';
import { FormattedTax } from './helpers';

export interface TaxCalculationProps {
  calculatedTax: FormattedTax;
}

export const TaxCalculation: FC<TaxCalculationProps> = ({ calculatedTax }) => {
  return <Typography variant="body2">{calculatedTax.calculation}</Typography>;
};
