import React, { FC } from 'react';
import { Trans } from '../../../../i18n';
import { Box, Divider, makeStyles, Typography } from '@material-ui/core';
import {
  CustomerInput,
  JobSiteInput,
  ProjectInput,
  ProductOrderInput,
  NoteInput,
} from '../../Inputs';
import OrderPriceSummary from '../../../OrdersView/OrderView/OrderPriceSummary';
import { FormSpy } from 'react-final-form';

const useStyles = makeStyles(
  ({ spacing, palette }) => ({
    formSidePanel: {
      minWidth: 300,
      maxWidth: 300,
      background: palette.background.default,
      display: 'flex',
      overflowX: 'auto',
      flexDirection: 'column',
    },
    sidePanelDivider: {
      marginTop: spacing(2),
      marginBottom: spacing(2),
    },
    scrollContainer: {
      overflowX: 'auto',
    },
  }),
  { name: 'NonServiceOrderSidebar' },
);

export const NonServiceOrderSidebar: FC = () => {
  const classes = useStyles();

  return (
    <Box className={classes.formSidePanel}>
      <Box className={classes.scrollContainer}>
        <Box padding={4} paddingBottom={2}>
          <Box mb={2}>
            <Typography variant="h5">
              <Trans>Create new order</Trans>
            </Typography>
          </Box>
          <Divider className={classes.sidePanelDivider} />
          <FormSpy>
            {({ form }) => (
              <CustomerInput
                required
                autoFocus
                ignoreWalkup
                onChange={(v) => {
                  if (!v) {
                    form.reset();
                  }
                }}
              />
            )}
          </FormSpy>
          <Divider className={classes.sidePanelDivider} />
          <JobSiteInput />
          <ProjectInput />
          <ProductOrderInput />
          <Divider className={classes.sidePanelDivider} />
          <NoteInput />
        </Box>
      </Box>
      <Box pr={4} pl={4}>
        <Divider />
      </Box>
      <OrderPriceSummary />
    </Box>
  );
};
