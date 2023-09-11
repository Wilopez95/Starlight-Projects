import React, { FC } from 'react';
import { Trans } from '../../../i18n';
import { makeStyles, Box, Button } from '@material-ui/core';

import { GetOrderQuery, OrderStatus } from '../../../graphql/api';
import { EditOrder } from '../../YardOperationConsole/EditOrder';
import { closeSidePanel, openSidePanel } from '../../../components/SidePanels';

const useStyles = makeStyles(({ spacing }) => ({
  root: {
    display: 'flex',
    width: '100%',
    justifyContent: 'space-between',
  },
  close: {
    marginRight: spacing(3),
  },
}));

export interface WalkupCustomerOrderViewActionsProps {
  order: GetOrderQuery['order'];
  formContainer?: React.ReactInstance | (() => React.ReactInstance | null) | null;
  onEditClose?(): void;
  onEditSubmitted?(): void;
}

export const WalkupCustomerOrderViewActions: FC<WalkupCustomerOrderViewActionsProps> = ({
  order,
  formContainer,
  onEditClose,
  onEditSubmitted,
}) => {
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      {order.status !== OrderStatus.Invoiced && (
        <Button
          fullWidth
          className={classes.close}
          color="primary"
          variant="outlined"
          onClick={closeSidePanel}
        >
          <Trans>Close</Trans>
        </Button>
      )}
      <Button
        fullWidth
        color="primary"
        variant="outlined"
        onClick={() =>
          openSidePanel({
            content: (
              <EditOrder orderId={order.id} readOnly noDrawer onSubmitted={onEditSubmitted} />
            ),
            onClose: onEditClose ? async () => onEditClose() : undefined,
            container: formContainer,
          })
        }
      >
        <Trans>Order Details</Trans>
      </Button>
    </Box>
  );
};

export default WalkupCustomerOrderViewActions;
