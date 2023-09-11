import React, { FC } from 'react';
import { Box, makeStyles, Typography } from '@material-ui/core';
import { CheckBoxField } from '@starlightpro/common';
import { Trans } from '../../../i18n';
import { InitialOrderTotal } from '../../YardOperationConsole/components/InitialOrderTotal';
import { LineItemsSum } from '../../YardOperationConsole/components/LineItemsSum';
import { TaxTotalField } from '../../YardOperationConsole/Inputs/TaxTotalField';
import { OrderGrandTotalField } from '../../YardOperationConsole/Inputs/OrderGrandTotalField';
import { ReadOnlyOrderFormComponent } from '../../YardOperationConsole/types';
import { TaxesInfoButton } from '../../YardOperationConsole/components/TaxesInfoButton';
import NewOrderTotal from '../../YardOperationConsole/components/NewOrderTotal';

const useStyles = makeStyles(
  ({ spacing }) => ({
    root: {
      flexShrink: 0,
      flexGrow: 1,
      display: 'flex',
      padding: spacing(4),
      flexDirection: 'column',
      justifyContent: 'flex-end',
    },
  }),
  { name: 'OrderPriceSummary' },
);

interface Props extends ReadOnlyOrderFormComponent {
  showInitialOrderTotal?: boolean;
  showNewOrderTotal?: boolean;
  showBillableItemsTotal?: boolean;
}

export const OrderPriceSummary: FC<Props> = ({
  readOnly,
  showInitialOrderTotal,
  showNewOrderTotal,
  showBillableItemsTotal,
}) => {
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      <CheckBoxField
        disabled={readOnly}
        label={<Trans>Unlock Overrides</Trans>}
        name="unlockOverrides"
      />
      {showInitialOrderTotal && <InitialOrderTotal />}
      {showNewOrderTotal && <NewOrderTotal />}
      {showBillableItemsTotal && <LineItemsSum />}
      <Box display="flex" justifyContent="space-between">
        <Typography variant="body2">
          <Trans>Taxes, $t(currency)</Trans>
          <TaxesInfoButton />
        </Typography>
        <Box display="flex" alignItems="center">
          <TaxTotalField />
        </Box>
      </Box>
      <Box display="flex" justifyContent="space-between">
        <Typography variant="body2">
          <Trans>Grand total, $t(currency)</Trans>
        </Typography>
        <Typography variant="body2">
          <b>
            <OrderGrandTotalField />
          </b>
        </Typography>
      </Box>
    </Box>
  );
};

export default OrderPriceSummary;
