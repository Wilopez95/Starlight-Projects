import React, { FC } from 'react';
import { Field } from 'react-final-form';
import { truncate } from 'lodash/fp';
import { Trans } from '../../../../i18n';
import { Box, makeStyles, Typography, Divider } from '@material-ui/core';

import { CustomerType } from '../../../../graphql/api';
import { ReadOnlyOrderFormComponent } from '../../types';
import { CommercialCustomerFields } from './CommercialCustomerFields';
import OrderPriceSummary from '../../../OrdersView/OrderView/OrderPriceSummary';
import { WalkupCustomerFields } from './WalkupCustomerFields';
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
    scrollContainer: {
      overflowX: 'auto',
    },
  }),
  { name: 'EditDumpOrderSidebar' },
);

interface Props extends ReadOnlyOrderFormComponent {
  title?: JSX.Element;
  showPriceSummary?: boolean;
  showInitialOrderTotal?: boolean;
  allowCreateNewTruck?: boolean;
  isInputFieldBlocked?: boolean;
  updateContext?: boolean;
}

export const EditDumpOrderSidebar: FC<Props> = ({
  readOnly,
  isInputFieldBlocked,
  title,
  showPriceSummary,
  showInitialOrderTotal,
  allowCreateNewTruck = true,
  updateContext,
}) => {
  const classes = useStyles();

  const titleText = title || (
    <>
      <Trans>Dump details</Trans>
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
              <Field name="customer.businessName" subscription={{ value: true }}>
                {({ input }) => (
                  <Typography variant="body2">{truncate({ length: 32 }, input.value)}</Typography>
                )}
              </Field>
            </Box>
          </Box>
          <Field name="customer.type" subscription={{ value: true }}>
            {({ input }) => (
              <>
                {input.value === CustomerType.Commercial && (
                  <CommercialCustomerFields
                    allowCreateNewTruck={allowCreateNewTruck}
                    readOnly={readOnly}
                    isInputFieldBlocked={isInputFieldBlocked}
                    updateContext={updateContext}
                    showTruckChangeNotification={showPriceSummary}
                  />
                )}
                {input.value === CustomerType.Walkup && (
                  <WalkupCustomerFields
                    readOnly={readOnly}
                    isInputFieldBlocked={isInputFieldBlocked}
                  />
                )}
              </>
            )}
          </Field>
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
