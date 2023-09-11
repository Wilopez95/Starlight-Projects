import React, { FC, useCallback, useState } from 'react';
import { ContentLoader } from '@starlightpro/common';
import { Trans, useTranslation } from '../../../i18n';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import { CustomerType, OrderType, useGetOrderQuery } from '../../../graphql/api';
import SidepanelView from '../../../components/SidepanelView';
import { orderTypeTranslationMapping } from '../constant';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import { closeSidePanel, openSidePanel } from '../../../components/SidePanels';
import CommercialCustomerOrderViewActions from './CommercialCustomerOrderViewActions';
import { WeightTicketThumb } from '../../YardOperationConsole/components/WeightTicketField/WeightTicketThumb';
import { openModal } from '@starlightpro/common/components/Modals';
import { PdfPreviewModalContent } from '../../YardOperationConsole/components/WeightTicketField/PdfPreviewModalContent';
import { printDialog } from '../../../utils/printDialog';
import WalkupCustomerOrderViewActions from './WalkupCustomerOrderViewActions';
import { ServiceOrderInformation } from './ServiceOrderInformation';
import { OrderStatusLabel } from './OrderStatusLabel';
import { OrderHistory } from './OrderHistory';
import TabPanel from '../../../components/TabPanel';

const useStyles = makeStyles(({ palette, typography, spacing }) => ({
  root: {
    width: 420,
    height: '100%',
  },
  label: {
    flex: 1,
    ...typography.body2,
    color: palette.text.secondary,
  },
  text: {
    flex: 2,
    ...typography.body2,
  },
  row: {
    display: 'flex',
    '&:not(:first-child)': {
      marginTop: spacing(2),
    },
  },
  divider: {
    marginTop: spacing(2),
  },
  title: {
    ...typography.h4,
  },
  clickable: {
    padding: 0,
    textDecoration: 'none',
    color: palette.blue,
  },
}));

export interface OrderViewProps {
  orderId: number;
  showChangeStatusActions?: boolean;
  quickViewContainer?: React.ReactInstance | (() => React.ReactInstance | null) | null;
  applicationUrl?: string;
  onEditClose?(): void;
  onEditSubmitted?(): void;
}

export const showOrder = (props: OrderViewProps) => {
  openSidePanel({
    content: <OrderView {...props} />,
    container: props.quickViewContainer,
  });
};

export const OrderView: FC<OrderViewProps> = ({
  onEditClose,
  onEditSubmitted,
  orderId,
  showChangeStatusActions = true,
  quickViewContainer,
  applicationUrl,
}) => {
  const classes = useStyles();
  const [tab, setTab] = useState<number>(0);

  const onTabChange = (event: React.ChangeEvent<{}>, value: any) => {
    setTab(value);
  };
  const { data, loading } = useGetOrderQuery({
    variables: {
      id: orderId,
    },
    fetchPolicy: 'no-cache',
  });

  const order = data?.order;
  const customer = data?.order.customer;
  const customerJobSite = data?.order.customerJobSite;
  const [t] = useTranslation();

  const printPdf = useCallback(() => {
    printDialog({ url: order?.weightTicketUrl || '' });
  }, [order?.weightTicketUrl]);

  const openWeightTicketPreview = useCallback(() => {
    openModal({
      content: <PdfPreviewModalContent orderId={orderId} />,
    });
  }, [orderId]);

  return (
    <SidepanelView
      onClose={closeSidePanel}
      noHeaderDivider
      classes={{
        paper: classes.root,
      }}
      title={
        <Box display="flex" flexDirection="column">
          <Typography className={classes.title} color="primary" component="span">
            <Trans>Order# {{ id: data?.order.haulingOrderId ?? orderId }}</Trans>
          </Typography>
          <Box alignSelf="flex-start">
            <OrderStatusLabel status={data?.order.status!} />
          </Box>
        </Box>
      }
      actions={
        order ? (
          customer && customer.type === CustomerType.Walkup ? (
            <WalkupCustomerOrderViewActions
              order={order}
              onEditClose={onEditClose}
              onEditSubmitted={onEditSubmitted}
            />
          ) : (
            <CommercialCustomerOrderViewActions
              showNextStatusAction={showChangeStatusActions}
              showPrevStatusAction={showChangeStatusActions}
              order={order}
              onEditClose={onEditClose}
              onEditSubmitted={onEditSubmitted}
              formContainer={quickViewContainer}
            />
          )
        ) : null
      }
    >
      {loading && <ContentLoader expanded />}
      <Tabs value={tab} onChange={onTabChange} indicatorColor="primary">
        <Tab value={0} label={t('Order Information')} />
        <Tab value={1} label={t('Order History')} />
      </Tabs>
      <TabPanel value={tab} index={0}>
        <Box className={classes.row} mt={2}>
          <Box className={classes.label}>
            <Trans>Order Date</Trans>
          </Box>
          <Box className={classes.text}>
            <Trans values={{ date: new Date(order?.createdAt) }} i18nKey="dateLabel" />
          </Box>
        </Box>
        <Box className={classes.row}>
          <Box className={classes.label}>
            <Trans>Customer</Trans>
          </Box>
          <Box className={classes.text}>{order?.customer.businessName}</Box>
        </Box>
        <Box className={classes.row}>
          <Box className={classes.label}>
            <Trans>Action</Trans>
          </Box>
          <Box className={classes.text}>
            {order && order.type && orderTypeTranslationMapping[order.type]}
          </Box>
        </Box>
        {order && order.type !== OrderType.NonService && (
          <ServiceOrderInformation applicationUrl={applicationUrl} order={order} />
        )}
        {order && (order.project || customerJobSite) && <Divider className={classes.divider} />}
        <Box className={classes.row}>
          <Box className={classes.label} alignSelf="center">
            <Trans>Ticket #</Trans>
          </Box>
          <Box
            className={classes.text}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            width="100%"
          >
            {order?.hasWeightTicket && order?.id && (
              <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
                <WeightTicketThumb orderId={order.id} />
                <Box className={classes.text} display="flex" ml={2}>
                  <Button className={classes.clickable} onClick={openWeightTicketPreview}>
                    {order.id}
                  </Button>
                </Box>
              </Box>
            )}
            {order?.weightTicketUrl && (
              <Button color="primary" variant="outlined" onClick={printPdf}>
                <Trans>Print</Trans>
              </Button>
            )}
          </Box>
        </Box>
      </TabPanel>
      <TabPanel value={tab} index={1}>
        <OrderHistory orderId={orderId} />
      </TabPanel>
    </SidepanelView>
  );
};

export default OrderView;
