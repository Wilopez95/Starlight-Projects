import React, { FC } from 'react';
import { Box, Toolbar, Typography } from '@material-ui/core';
import classNames from 'classnames';
import { Trans } from '../../../i18n';
import { makeStyles } from '@material-ui/core/styles';
import { ImagesContainer } from '../../YardOperationConsole/EditDumpOrder/ArrivalDumpOrderForm/ImagesContainer';
import { CustomerTruckTypes } from '../../../graphql/api';
import { customerTruckTypeTranslationMapping } from '../../../constants/mapping';
import { GradingOrder } from '../types';

export interface GradingEditHeaderProps {
  order: GradingOrder;
}

const useStyles = makeStyles(() => ({
  root: {},
  heading: {
    minWidth: 240,
    '& > p': {
      opacity: 0.6,
    },
  },
  toolbar: {
    display: 'flex',
    minHeight: 112,
  },
  images: {
    marginLeft: 'auto',
    margin: '1rem 0 1rem auto',
  },
  shadow: {
    boxShadow: '0 2px 8px 0 rgba(223, 227, 232, 1)',
  },
}));

export const GradingEditHeader: FC<GradingEditHeaderProps> = ({ order }) => {
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      <Toolbar className={classNames(classes.toolbar, classes.shadow)}>
        <Box className={classes.heading}>
          <Typography variant="h4">
            <Trans values={{ orderId: order.id }}>Work Order</Trans>
          </Typography>
          <Typography variant="body2">{`${order.customerTruck?.truckNumber} (${
            customerTruckTypeTranslationMapping[order.customerTruck?.type as CustomerTruckTypes]
          }) ${order.customer.businessName}`}</Typography>
        </Box>
        <Box className={classes.images}>
          <ImagesContainer
            imageContainerSize="100px"
            alignGridItems="flex-end"
            maxCount={10}
            hideTitle
            orderId={order.id}
          />
        </Box>
      </Toolbar>
    </Box>
  );
};
