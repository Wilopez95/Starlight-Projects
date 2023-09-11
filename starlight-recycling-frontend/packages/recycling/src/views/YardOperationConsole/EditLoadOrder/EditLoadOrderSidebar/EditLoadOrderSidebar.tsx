import React, { FC } from 'react';
import { truncate } from 'lodash/fp';
import { Field } from 'react-final-form';
import { Trans } from '../../../../i18n';
import { Box, Divider, makeStyles, Typography } from '@material-ui/core';

import { CustomerType, GetOrderQuery } from '../../../../graphql/api';
import { CommercialCustomerFields } from './CommercialCustomerFields';
import { ReadOnlyOrderFormComponent } from '../../types';
import OrderPriceSummary from '../../../OrdersView/OrderView/OrderPriceSummary';
import { WalkupCustomerFields } from './WalkupCustomerFields';
import OrderStatusLabel from '../../components/OrderStatusLabel';

const useStyles = makeStyles(
  ({ spacing }) => ({
    formSidePanel: {
      display: 'flex',
      flexDirection: 'column',
      flexGrow: 1,
      width: '100%',
    },
    sidePanelDivider: {
      marginTop: spacing(2),
      marginBottom: spacing(2),
    },
    scrollContainer: {
      overflowX: 'auto',
    },
  }),
  { name: 'EditDumpOrderSidebar' },
);

interface Props extends ReadOnlyOrderFormComponent {
  customer: GetOrderQuery['order']['customer'];
  title?: string | JSX.Element;
  showPriceSummary?: boolean;
  showInitialOrderTotal?: boolean;
  allowCreateNewTruck?: boolean;
  isInputFieldBlocked?: boolean;
  updateContext?: boolean;
}

export const EditLoadOrderSidebar: FC<Props> = ({
  title,
  customer,
  readOnly,
  isInputFieldBlocked,
  showPriceSummary,
  showInitialOrderTotal,
  allowCreateNewTruck,
  updateContext,
}) => {
  const classes = useStyles();

  const titleText = title || (
    <>
      <Trans>Load details</Trans>
      &nbsp;
      <Field name="id" subscription={{ value: true }}>
        {({ input }) => `#${input.value}`}
      </Field>
    </>
  );

  return (
    <Box className={classes.formSidePanel}>
      <Box className={classes.scrollContainer}>
        <Box padding={4} paddingBottom={2}>
          <Box mb={2}>
            <Typography variant="h5">{titleText}</Typography>
          </Box>
          <Box mb={2}>
            <OrderStatusLabel />
          </Box>
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
          {customer.type === CustomerType.Commercial && (
            <CommercialCustomerFields
              allowCreateNewTruck={allowCreateNewTruck}
              readOnly={readOnly}
              isInputFieldBlocked={isInputFieldBlocked}
              updateContext={updateContext}
              showMaterialAndDestination={showPriceSummary}
              showTruckChangeNotification={showPriceSummary}
            />
          )}
          {customer.type === CustomerType.Walkup && <WalkupCustomerFields readOnly={readOnly} />}
        </Box>
      </Box>
      {showPriceSummary && (
        <>
          <Box pr={4} pl={4}>
            <Divider />
          </Box>
          <OrderPriceSummary
            readOnly={readOnly}
            showInitialOrderTotal={showInitialOrderTotal}
            showBillableItemsTotal
          />
        </>
      )}
    </Box>
  );
};
