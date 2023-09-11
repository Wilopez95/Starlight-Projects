import React, { FC } from 'react';
import { Trans } from '../../../../i18n';
import { Box, Divider, Grid, Typography } from '@material-ui/core';

import { PaymentMethodInput, PriceGroupInput, AdditionalPaymentFields } from '../../Inputs';
import { BillableItemsTable } from '../../components/BillableItemsTable';
import { AddNewBillableItemButton } from '../../components/AddNewBillableItemButton';
import { PrintWeightTicketField } from '../../components/PrintWeightTicketField';
import { ReadOnlyOrderFormComponent } from '../../types';
import { WeightTicketField } from '../../components/WeightTicketField';

export interface OrderPaymentFormProps extends ReadOnlyOrderFormComponent {
  print?: boolean;
  weightTicket?: boolean;
}

export const OrderPaymentForm: FC<OrderPaymentFormProps> = ({
  readOnly,
  print,
  weightTicket = true,
}) => {
  return (
    <Box mt={2}>
      <Typography variant="h6">
        <Trans>Pricing & Payment</Trans>
      </Typography>
      <Grid container spacing={1}>
        <Grid item xs={6}>
          <PaymentMethodInput readOnly={readOnly} />
        </Grid>
        <Grid item xs={6}>
          <PriceGroupInput readOnly={readOnly} />
        </Grid>
      </Grid>
      <AdditionalPaymentFields readOnly={readOnly} />
      <Box mt={2}>
        <Divider />
      </Box>
      <Box mt={2}>
        <Typography variant="h6">
          <Trans>Billable Items</Trans>
        </Typography>
        <BillableItemsTable readOnly={readOnly} />
        <Box display="flex" width="100%" justifyContent="flex-end" mt={2} mb={2}>
          {!readOnly && <AddNewBillableItemButton />}
        </Box>
      </Box>
      {weightTicket && (print ? <PrintWeightTicketField /> : <WeightTicketField />)}
    </Box>
  );
};
