import React, { FC, useCallback, useContext, useEffect, useState } from 'react';
import { useField } from 'react-final-form';
import { useTranslation } from '../../../../i18n';

import { TruckWeight } from './components/TruckWeight';
import { ContainerWeight } from './components/ContainerWeight';
import {
  CustomerTruckTypes,
  HaulingMaterial,
  useGetCustomerTruckLazyQuery,
  useGetEquipmentItemLazyQuery,
} from '../../../../graphql/api';
import { Box, Button, Divider, makeStyles, Typography } from '@material-ui/core';
import { CaptureWeightSvg } from './Images/CaptureWeightSvg';
import { SidebarButton } from './components/SidebarButton';
import Scale from '../../../../components/Scale';
import { useCompanyMeasurementUnits } from '../../../../hooks/useCompanyMeasurementUnits';
import {
  convertKgToUom,
  getUomTranslation,
  UnitOfMeasurementType,
} from '../../../../hooks/useUnitOfMeasurementConversion';
import { MaterialOrderContext } from '../../../../utils/contextProviders/MaterialOrderProvider';
import { getNetWeight } from '../../helpers/getNetWeight';
import { useScale } from '../../../../hooks/useScale';

const useStyles = makeStyles(
  ({ spacing, palette }) => ({
    drawer: {
      flexShrink: 0,
    },
    drawerContainer: {},
    dividerInverted: {
      backgroundColor: palette.grey['300'],
    },
    submitSection: {
      marginTop: 'auto',
      width: '100%',
      display: 'flex',
      justifyContent: 'space-between',
      background: palette.grey['800'],
      padding: spacing(2, 0),

      '& > *': {
        margin: spacing(0, 2),
      },
    },
    contentWrapper: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      width: '100%',
      padding: spacing(2, 3),
      overflow: 'hidden',
      flexShrink: 0,
    },
    mainContent: {
      flexShrink: 1,
      'overflow-y': 'auto',
    },
    cancelButton: {
      backgroundColor: palette.grey['900'],
      color: palette.common.white,
      '&:hover': {
        backgroundColor: palette.grey['800'],
      },
    },
  }),
  { name: 'OrderFormSidebar' },
);

interface Props {
  captureTareWeightEnabled?: boolean;
  isSelfService?: boolean;
}

export const OrderFormSidebar: FC<Props> = ({
  captureTareWeightEnabled = false,
  isSelfService = false,
}) => {
  const { unitOfMeasurementType: selectedScaleUnitOfMeasurementType } = useScale();

  const classes = useStyles();
  const [showCaptureTareWeightButton, setShowCaptureTareWeight] = useState(false);
  const {
    input: { value: customerTruck },
  } = useField('customerTruck', { subscription: { value: true } });
  let {
    input: { value: weightScaleUom },
  } = useField('weightScaleUom', { subscription: { value: true } });
  const {
    input: { value: type },
  } = useField('type', { subscription: { value: true } });

  const customerTruckId = customerTruck?.id;
  const {
    input: { value: containerId },
  } = useField('containerId', { subscription: { value: true } });
  const [getCustomerTruck, _] = useGetCustomerTruckLazyQuery({
    fetchPolicy: 'no-cache',
  });
  const [getEquipment, { data: equipmentData }] = useGetEquipmentItemLazyQuery({
    fetchPolicy: 'no-cache',
  });

  let {
    input: { value: weightInInput },
  } = useField('weightIn', { subscription: { value: true } });
  const {
    input: { value: weightOut },
  } = useField('weightOut', { subscription: { value: true } });
  const {
    input: { value: id },
  } = useField('id', { subscription: { value: true } });

  let { massTranslation } = useCompanyMeasurementUnits();
  const { t } = useTranslation();

  const materialContext = useContext(MaterialOrderContext);
  weightScaleUom = id && id !== '' ? weightScaleUom : selectedScaleUnitOfMeasurementType;

  massTranslation = weightScaleUom ? getUomTranslation(weightScaleUom) : massTranslation;

  const [material, setMaterial] = useState<
    | ({
        __typename?: 'HaulingMaterial' | undefined;
      } & Pick<
        HaulingMaterial,
        'id' | 'description' | 'misc' | 'useForDump' | 'useForLoad' | 'units'
      >)
    | undefined
  >(materialContext.material);

  useEffect(() => {
    setMaterial(materialContext.material);
  }, [materialContext]);

  useEffect(() => {
    if (customerTruckId) {
      getCustomerTruck({ variables: { id: Number(customerTruckId) } });
    }
    setShowCaptureTareWeight(false);
  }, [customerTruckId, getCustomerTruck]);

  useEffect(() => {
    if (containerId) {
      getEquipment({ variables: { id: Number(containerId) } });
    }
  }, [containerId, getEquipment]);

  const refetchTruckAndContainer = useCallback(() => {
    getCustomerTruck({ variables: { id: Number(customerTruckId) } });
    getEquipment({ variables: { id: Number(containerId) } });
  }, [getCustomerTruck, getEquipment, customerTruckId, containerId]);

  const materialUnits = material?.units || undefined;

  const useUOMUnity = weightScaleUom || materialUnits || UnitOfMeasurementType.ShortTons;

  const truckTareWeight =
    (customerTruck && convertKgToUom(Number(customerTruck.emptyWeight), useUOMUnity)) || 0;

  const canTare = equipmentData?.equipment?.emptyWeight;

  const convertCanTare =
    customerTruck?.type === CustomerTruckTypes.Rolloff
      ? convertKgToUom(
          Number(canTare),
          useUOMUnity ? (useUOMUnity as UnitOfMeasurementType) : UnitOfMeasurementType.ShortTons,
        )
      : 0;

  const netWeight =
    getNetWeight(type, weightInInput, weightOut, weightScaleUom, materialUnits) || 0;

  return (
    <Box width="100%">
      <Box width="100%" paddingBottom={2}>
        {!isSelfService && <Scale weightScaleUom={weightScaleUom} />}
      </Box>
      <Box display="flex" justifyContent="space-between" width="100%" mb={1}>
        <Typography variant="body2">{`${t('Truck tare')} (${massTranslation})`}</Typography>
        <Typography variant="body2">{truckTareWeight || '--'}</Typography>
      </Box>
      <Box display="flex" justifyContent="space-between" width="100%" mb={1}>
        <Typography variant="body2">{`${t('Can tare')} (${massTranslation})`}</Typography>
        <Typography variant="body2">{convertCanTare || '--'}</Typography>
      </Box>
      <Box display="flex" justifyContent="space-between" width="100%" mb={1}>
        <Typography variant="body2">{`${t('Net weight')} (${massTranslation})`}</Typography>
        <Typography variant="body2">{netWeight.toFixed(2) || '--'}</Typography>
      </Box>
      {captureTareWeightEnabled && !showCaptureTareWeightButton && (
        <Box marginTop={3} marginBottom={3} width="100%">
          <SidebarButton
            color="secondary"
            variant="contained"
            fullWidth
            disabled={!customerTruckId}
            onClick={() => setShowCaptureTareWeight(true)}
          >
            <CaptureWeightSvg />
            {t('Capture Tare Weight')}
          </SidebarButton>
        </Box>
      )}
      {showCaptureTareWeightButton && (
        <Box>
          <TruckWeight customerTruckId={customerTruckId} containerId={containerId} />
          <Divider className={classes.dividerInverted} />
          <ContainerWeight customerTruckId={customerTruckId} containerId={containerId} />
        </Box>
      )}
      {showCaptureTareWeightButton && (
        <Box className={classes.submitSection}>
          <Button
            className={classes.cancelButton}
            variant="contained"
            onClick={() => {
              setShowCaptureTareWeight(false);
              refetchTruckAndContainer();
            }}
            fullWidth
          >
            {t('Cancel')}
          </Button>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => {
              setShowCaptureTareWeight(false);
              refetchTruckAndContainer();
            }}
          >
            {t('Done')}
          </Button>
        </Box>
      )}
    </Box>
  );
};
