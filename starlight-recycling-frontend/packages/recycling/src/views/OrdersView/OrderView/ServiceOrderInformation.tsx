import React, { FC, useCallback, useMemo } from 'react';
import { Trans, useTranslation } from '../../../i18n';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import { useOpenFormWithCloseConfirmation } from '@starlightpro/common';

import { CustomerTruckTypes, GetOrderQuery, OrderType } from '../../../graphql/api';
import Divider from '@material-ui/core/Divider';
import Link from '@material-ui/core/Link';
import { EditProjectForm } from '../../../components/ProjectForm';
import { customerTruckTypeTranslationMapping } from '../../../constants/mapping';
import { useCompanyMeasurementUnits } from '../../../hooks/useCompanyMeasurementUnits';
import { useCompanySettings } from '../../../hooks/useCompanySettings';
import { useHistory } from 'react-router';
import { HAULING_FE_URL } from '@starlightpro/common/src/constants';
import { closeSidePanel } from '@starlightpro/common/components/SidePanels';
import {
  convertKgToUom,
  getUomTranslation,
  getUomTypeFromString,
} from '../../../hooks/useUnitOfMeasurementConversion';

const useStyles = makeStyles(({ palette, typography, spacing }) => ({
  root: {
    width: 360,
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
    color: palette.success.main,
  },
}));

interface Props {
  applicationUrl?: string;
  order: GetOrderQuery['order'];
}

export const ServiceOrderInformation: FC<Props> = ({ applicationUrl, order }) => {
  const classes = useStyles();
  const [t] = useTranslation();
  const [openModalWithCloseConfirmation] = useOpenFormWithCloseConfirmation({ modal: true });
  const { convertWeights, massTranslation } = useCompanyMeasurementUnits();
  const { businessUnitId } = useCompanySettings();
  const history = useHistory();
  const jobSite = order.jobSite;
  const isSDKOrigin = document.location.origin === applicationUrl;
  const jobSitePath = useMemo(() => {
    const { customer: { id: customerId = '' } = {}, jobSiteId } = order;

    return `/business-units/${businessUnitId}/customer/${customerId}/job-sites/${jobSiteId}/open-orders`;
  }, [businessUnitId, order]);

  const handleRedirectClick = useCallback(
    (e) => {
      if (isSDKOrigin) {
        e.preventDefault();
        closeSidePanel();
        history.push(jobSitePath);
      }
    },
    [history, isSDKOrigin, jobSitePath],
  );

  const customerJobSite = order.customerJobSite;
  const customerTruck = order.customerTruck;

  const openProject = useCallback(() => {
    if (!order || !order.project || !customerJobSite) {
      return;
    }
    openModalWithCloseConfirmation({
      form: <EditProjectForm customerJobSiteId={customerJobSite.id} projectId={order.project.id} />,
    });
  }, [customerJobSite, openModalWithCloseConfirmation, order]);

  const convertMassUnit = (amount: number): number => {
    const uomType = order.weightScaleUom || order.material?.units;

    if (uomType) {
      return convertKgToUom(amount, getUomTypeFromString(uomType));
    }

    return convertWeights(amount);
  };

  const getMassTranslation = (): string => {
    const uomType = order.weightScaleUom || order.material?.units;

    if (uomType) {
      return getUomTranslation(uomType);
    }

    return massTranslation;
  };

  return (
    <>
      <Box className={classes.row}>
        <Box className={classes.label}>
          <Trans>Truck#</Trans>
        </Box>
        <Box className={classes.text}>
          {customerTruck &&
            `${customerTruck.truckNumber} / ${
              customerTruckTypeTranslationMapping[customerTruck.type]
            }`}
        </Box>
      </Box>
      <Box className={classes.row}>
        <Box className={classes.label}>
          <Trans>WO#</Trans>
        </Box>
        <Box className={classes.text}>{order?.WONumber}</Box>
      </Box>
      <Box className={classes.row}>
        <Box className={classes.label}>
          <Trans>Time In / Out</Trans>
        </Box>
        <Box className={classes.text}>
          {order &&
            `→ ${t('time', { value: order.arrivedAt })} / ← ${
              order.departureAt ? t('time', { value: order.departureAt }) : '-'
            }`}
        </Box>
      </Box>
      <Box className={classes.row}>
        <Box className={classes.label}>{`${t('Weight In / Out')} (${getMassTranslation()})`}</Box>
        <Box className={classes.text}>
          {order &&
            `→ ${convertMassUnit(order.weightIn || 0)} / ← ${
              order.weightOut ? convertMassUnit(order.weightOut) : '-'
            }`}
        </Box>
      </Box>
      <Box className={classes.row}>
        <Box className={classes.label}>
          <Trans>Tare Weight Applied</Trans>
        </Box>
        <Box className={classes.text}>{order.bypassScale ? 'Yes' : 'No'}</Box>
      </Box>
      <Box className={classes.row}>
        <Box className={classes.label}>{`${t('Net Weight')} (${getMassTranslation()})`}</Box>
        <Box className={classes.text}>
          {order && convertMassUnit(Math.abs((order.weightIn || 0) - (order.weightOut || 0)))}
        </Box>
      </Box>
      {customerTruck?.type === CustomerTruckTypes.Rolloff && (
        <Box className={classes.row}>
          <Box className={classes.label}>
            <Trans>Can Size</Trans>
          </Box>
          <Box className={classes.text}>{order?.container?.description}</Box>
        </Box>
      )}
      <Divider className={classes.divider} />
      {order && order.type !== OrderType.Load && customerJobSite && (
        <Box className={classes.row}>
          <Box className={classes.label}>
            <Trans>Job Site</Trans>
          </Box>
          <Box className={classes.text}>
            <Link
              onClick={handleRedirectClick}
              target="_blank"
              href={`${HAULING_FE_URL ?? applicationUrl}${jobSitePath}`}
              className={classes.clickable}
            >
              {jobSite?.fullAddress}
            </Link>
          </Box>
        </Box>
      )}
      {order && order.type !== OrderType.Load && order.project && (
        <Box className={classes.row}>
          <Box className={classes.label}>
            <Trans>Project</Trans>
          </Box>
          <Box className={classes.text}>
            <Link href="#" className={classes.clickable} onClick={openProject}>
              {order.project.description}
            </Link>
          </Box>
        </Box>
      )}
    </>
  );
};
