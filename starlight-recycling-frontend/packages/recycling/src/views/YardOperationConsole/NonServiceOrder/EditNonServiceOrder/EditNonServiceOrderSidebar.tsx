import React, { FC } from 'react';
import { truncate } from 'lodash/fp';
import { Trans } from '../../../../i18n';
import { Box, Divider, makeStyles, Typography } from '@material-ui/core';
import { JobSiteInput, ProjectInput, ProductOrderInput, NoteInput } from '../../Inputs';
import { GetOrderQuery } from '../../../../graphql/api';
import { ReadOnlyOrderFormComponent } from '../../types';
import OrderPriceSummary from '../../../OrdersView/OrderView/OrderPriceSummary';
import OrderStatusLabel from '../../components/OrderStatusLabel';

const useStyles = makeStyles(
  ({ spacing }) => ({
    formSidePanel: {
      display: 'flex',
      flexDirection: 'column',
      flexGrow: 1,
    },
    sidePanelDivider: {
      marginTop: spacing(2),
      marginBottom: spacing(2),
    },
  }),
  { name: 'EditDumpOrderSidebar' },
);

interface Props extends ReadOnlyOrderFormComponent {
  orderId: number;
  customer: GetOrderQuery['order']['customer'];
}

export const NonServiceOrderSidebar: FC<Props> = ({ customer, orderId, readOnly }) => {
  const classes = useStyles();

  return (
    <Box className={classes.formSidePanel}>
      <Box p={4}>
        <Box mb={2}>
          <Typography variant="h5">
            <Trans values={{ orderId }}>Order #{{ orderId }}</Trans>
          </Typography>
        </Box>
        <Box mb={2}>
          <OrderStatusLabel />
        </Box>
        <Divider className={classes.sidePanelDivider} />
        <Box mb={2}>
          <Typography variant="body2" color="textSecondary">
            <Trans>Customer</Trans>:{' '}
          </Typography>
          <Box mt={1}>
            <Typography variant="body2">
              {truncate({ length: 32 }, customer.businessName ?? '')}
            </Typography>
          </Box>
        </Box>
        <Divider className={classes.sidePanelDivider} />
        <JobSiteInput readOnly={readOnly} />
        <ProjectInput readOnly={readOnly} />
        <ProductOrderInput readOnly={readOnly} />
        <Divider className={classes.sidePanelDivider} />
        <NoteInput readOnly={readOnly} />
      </Box>
      <OrderPriceSummary readOnly={readOnly} showInitialOrderTotal showNewOrderTotal />
    </Box>
  );
};
