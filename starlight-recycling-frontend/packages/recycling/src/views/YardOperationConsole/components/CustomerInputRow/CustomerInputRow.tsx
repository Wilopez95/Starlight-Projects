import { Box, makeStyles } from '@material-ui/core';
import React, { FC } from 'react';
import { WalkUpCustomerInput } from '../../Inputs/WalkUpCustomerInput';
import { CustomerInput } from '../../Inputs/CustomerInput';
import { CustomerOption } from '../../../../components/FinalForm/CustomerSearchField';

const useStyles = makeStyles(
  () => ({
    walkupCustomerField: {
      marginTop: 28,
    },
  }),
  { name: 'CustomerInputRow' },
);

export interface CustomerInputRowProps {
  autoFocus?: boolean;
  /**
   * filter for the list of customers
   *
   * null - all
   * true - only active
   * false - only inactive
   */
  active?: boolean | null;
  onChange?: (value: CustomerOption) => void;
}

export const CustomerInputRow: FC<CustomerInputRowProps> = ({
  autoFocus,
  active = null,
  onChange,
}) => {
  const classes = useStyles();

  return (
    <Box display="flex" alignItems="flex-start">
      <Box width="70%" mr={2}>
        <CustomerInput autoFocus={autoFocus} active={active} onChange={onChange} />
      </Box>
      <Box width="30%">
        <WalkUpCustomerInput className={classes.walkupCustomerField} />
      </Box>
    </Box>
  );
};
