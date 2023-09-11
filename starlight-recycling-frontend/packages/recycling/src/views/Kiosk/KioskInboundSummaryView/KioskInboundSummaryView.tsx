import React, { useCallback, useMemo } from 'react';
import { Paths } from '../../../routes';
import { useParams } from 'react-router';
import { ParamsKeys } from '../../../routes/Params';
import {
  GetOrderQuery,
  OrderBillableItem,
  OrderBillableItemType,
  useGetOrderQuery,
  useUpdateOrderMutation,
} from '../../../graphql/api';
import { ContentLoader, showSuccess } from '@starlightpro/common';
import { SelfServiceFooter } from '../components/SelfServiceFooter';
import { Trans, useTranslation } from '../../../i18n';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { openModal } from '@starlightpro/common/components/Modals';
import { TaxesInfoModal } from '../../YardOperationConsole/components/TaxesInfoButton/TaxesInfoModal';
import { IconButton } from '@material-ui/core';
import InfoIcon from '@material-ui/icons/Info';
import {
  MeasureTarget,
  useCompanyMeasurementUnits,
} from '../../../hooks/useCompanyMeasurementUnits';
import { GeneralKioskView } from '../components';
import cs from 'classnames';
import { getOrderUpdateInput } from '../../YardOperationConsole/helpers/getOrderUpdateInput';
import { getDumpInitialValues } from '../../YardOperationConsole/EditDumpOrder/getDumpInitialValues';
import { useRegion } from '../../../hooks/useRegion';
import { mathRound2 } from '../../../utils/mathRound';

const useStyles = makeStyles(({ spacing, typography, palette }) => ({
  label: {
    flex: 1.5,
    ...typography.body2,
    color: palette.text.secondary,
  },
  text: {
    flex: 2,
    textAlign: 'right',
    ...typography.body2,
  },
  total: {
    color: palette.text.primary,
  },
  taxesInfoBtn: {
    padding: 0,
    marginLeft: spacing(1),
    height: '10px',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    '&:not(:first-child)': {
      marginTop: spacing(2),
    },
  },
  divider: {
    marginTop: spacing(2),
  },
}));

export const KioskInboundSummaryView = () => {
  const { orderId } = useParams<ParamsKeys>();
  const classes = useStyles();
  const { t } = useTranslation();
  const emptyText = useMemo(() => t('__Empty'), [t]);
  const { massTranslation, convertWeights } = useCompanyMeasurementUnits();

  const { data, loading } = useGetOrderQuery({
    variables: {
      id: +orderId,
    },
    fetchPolicy: 'cache-and-network',
  });
  const [updateOrderMutation] = useUpdateOrderMutation();

  const order = convertWeights(data?.order) as GetOrderQuery['order'];

  const showTaxesModal = useCallback(() => {
    if (!order) {
      return;
    }
    openModal({
      content: (
        <TaxesInfoModal
          customerId={order.customer.id}
          originDistrictId={order.originDistrictId}
          jobSiteId={order.jobSiteId}
          commercialTaxesUsed
          orderBillableItems={order.billableItems as OrderBillableItem[]}
          billableServiceId={order.billableService?.id}
          type={order.type}
        />
      ),
    });
  }, [order]);

  const originDistrict = useMemo(() => {
    if (order?.originDistrict) {
      const { state, county, city } = order.originDistrict;

      return [state, county, city].filter((x) => !!x).join(', ');
    }

    return emptyText;
  }, [emptyText, order]);

  const materialBillableItem = useMemo(
    () => order?.billableItems.find(({ type }) => type === OrderBillableItemType.Material),
    [order],
  );
  const fee = useMemo(
    () => order?.billableItems.find(({ type }) => type === OrderBillableItemType.Fee),
    [order],
  );

  const feeTotal = useMemo(() => (fee?.price ?? 0) * (fee?.quantity ?? 0), [fee]);
  const materialPrice = mathRound2(materialBillableItem?.price ?? 0);
  const totalTons = mathRound2(materialPrice * (materialBillableItem?.quantity ?? 0));
  const { formatMoney } = useRegion();

  const handleUpdateDepartureTime = useCallback(async () => {
    if (!order) {
      return;
    }

    const values = getDumpInitialValues(order);

    await updateOrderMutation({
      variables: {
        data: convertWeights(
          getOrderUpdateInput({
            ...values,
            id: values.id,
            departureAt: new Date(),
          }),
          MeasureTarget.backend,
        ),
      },
    });

    showSuccess(<Trans>Order has been updated!</Trans>);
  }, [updateOrderMutation, order, convertWeights]);

  if (loading) {
    return <ContentLoader expanded />;
  }

  return (
    <GeneralKioskView
      footer={
        <SelfServiceFooter
          prevPage={Paths.KioskModule.AttachPhotos}
          nextPage={Paths.KioskModule.Kiosk}
          submitText={<Trans>Finish And Leave Yard</Trans>}
          onGoNextStep={handleUpdateDepartureTime}
        />
      }
      title={<Trans>Inbound Summary</Trans>}
    >
      {loading && <ContentLoader expanded />}
      <Box className={classes.row}>
        <Box className={classes.label}>
          <Trans>Customer</Trans>
        </Box>
        <Box className={classes.text}>{order?.customer.businessName}</Box>
      </Box>
      <Divider className={classes.divider} />
      <Box className={classes.row}>
        <Box className={classes.label}>
          <Trans>Truck</Trans>
        </Box>
        <Box className={classes.text}>{order?.customerTruck?.truckNumber}</Box>
      </Box>
      <Divider className={classes.divider} />
      <Box className={classes.row}>
        <Box className={classes.label}>
          <Trans>Can Size</Trans>
        </Box>
        <Box className={classes.text}>{order?.container?.description}</Box>
      </Box>
      <Divider className={classes.divider} />
      <Box className={classes.row}>
        <Box className={classes.label}>
          <Trans>Job Site</Trans>
        </Box>
        <Box className={classes.text}>{order?.jobSite?.fullAddress}</Box>
      </Box>
      <Divider className={classes.divider} />
      <Box className={classes.row}>
        <Box className={classes.label}>
          <Trans>Project ID</Trans>
        </Box>
        <Box className={classes.text}>{order?.project?.description ?? emptyText}</Box>
      </Box>
      <Divider className={classes.divider} />
      <Box className={classes.row}>
        <Box className={classes.label}>
          <Trans>PO#</Trans>
        </Box>
        <Box className={classes.text}>{order?.PONumber ?? emptyText}</Box>
      </Box>
      <Divider className={classes.divider} />
      <Box className={classes.row}>
        <Box className={classes.label}>
          <Trans>WO#</Trans>
        </Box>
        <Box className={classes.text}>{order?.WONumber}</Box>
      </Box>
      <Divider className={classes.divider} />
      <Box className={classes.row}>
        <Box className={classes.label}>
          <Trans>Origin</Trans>
        </Box>
        <Box className={classes.text}>{originDistrict}</Box>
      </Box>
      <Divider className={classes.divider} />
      <Box className={classes.row}>
        <Box className={classes.label}>
          <Trans>Material</Trans>
        </Box>
        <Box className={classes.text}>{order?.material?.description}</Box>
      </Box>
      <Divider className={classes.divider} />
      <Box className={classes.row}>
        <Box className={classes.label}>
          <Trans>Net Weight</Trans>, ({massTranslation})
        </Box>
        <Box className={classes.text}>
          {order && mathRound2((order.weightIn || 0) - (order.weightOut || 0)).toLocaleString()}
        </Box>
      </Box>
      <Divider className={classes.divider} />
      <Box mt={2}>
        <Typography variant="h4">
          <Trans>Totals, $t(currency)</Trans>
        </Typography>
      </Box>
      <Box className={classes.row}>
        <Box className={classes.label}>
          <Trans>Disposal by</Trans> ({massTranslation})<Trans>, $t(currency)</Trans>
        </Box>
        <Box className={classes.text}>{formatMoney(materialPrice)}</Box>
      </Box>
      <Divider className={classes.divider} />
      <Box className={classes.row}>
        <Box className={classes.label}>
          <Trans>Total, $t(currency)</Trans>
        </Box>
        <Box className={classes.text}>{formatMoney(totalTons)}</Box>
      </Box>
      <Divider className={classes.divider} />
      <Box className={classes.row}>
        <Box className={classes.label}>
          <Trans>Fee, $t(currency)</Trans>
        </Box>
        <Box className={classes.text}>{formatMoney(feeTotal ?? 0)}</Box>
      </Box>
      <Divider className={classes.divider} />
      <Box className={classes.row}>
        <Box className={classes.label}>
          <Trans>Taxes, $t(currency)</Trans>
          <IconButton className={classes.taxesInfoBtn} onClick={showTaxesModal} color="primary">
            <InfoIcon />
          </IconButton>
        </Box>
        <Box className={classes.text}>{formatMoney(order.taxTotal)}</Box>
      </Box>
      <Divider className={classes.divider} />
      <Box className={classes.row} mb={2}>
        <Box className={cs(classes.label, classes.total)}>
          <Typography variant="h5">
            <Trans>Total Price, $t(currency)</Trans>
          </Typography>
        </Box>
        <Box className={classes.text}>
          <Typography variant="h5">{formatMoney(totalTons + feeTotal + order.taxTotal)}</Typography>
        </Box>
      </Box>
    </GeneralKioskView>
  );
};
