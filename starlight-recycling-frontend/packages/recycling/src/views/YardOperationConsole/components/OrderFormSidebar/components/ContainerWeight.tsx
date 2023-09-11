import React, { FC, useEffect, useMemo } from 'react';
import { omit } from 'lodash/fp';
import { useTranslation } from '../../../../../i18n';
import { Field, Form, FormSpy } from 'react-final-form';
import { Box, CircularProgress, Typography } from '@material-ui/core';

import {
  useGetCustomerTruckQuery,
  CustomerTruckTypes,
  useUpdateEquipmentMutation,
  EquipmentUpdateInput,
  useGetEquipmentItemLazyQuery,
} from '../../../../../graphql/api';
import { SidebarButton } from './SidebarButton';
import { CaptureWeightSvg } from '../Images/CaptureWeightSvg';
import { WeightTheContainerSvg } from '../Images/WeightTheContainerSvg';
import { useScale } from '../../../../../hooks/useScale';
import { showError } from '@starlightpro/common';
import {
  MeasureTarget,
  useCompanyMeasurementUnits,
} from '../../../../../hooks/useCompanyMeasurementUnits';
import { mathRound2 } from '../../../../../utils/mathRound';
import {
  convertKgToUom,
  UnitOfMeasurementType,
} from '../../../../../hooks/useUnitOfMeasurementConversion';

interface Props {
  containerId: number;
  customerTruckId: number;
}

export const ContainerWeight: FC<Props> = ({ customerTruckId, containerId }) => {
  const [getEquipmentItem, { data }] = useGetEquipmentItemLazyQuery();
  const { data: customerTruck } = useGetCustomerTruckQuery({ variables: { id: customerTruckId } });
  const [updateEquipment] = useUpdateEquipmentMutation();
  const scale = useScale();
  const { convertWeights, massTranslation } = useCompanyMeasurementUnits();
  const { t } = useTranslation();

  useEffect(() => {
    if (containerId) {
      getEquipmentItem({ variables: { id: containerId } });
    }
  }, [getEquipmentItem, containerId]);

  const { enableWeightCapturing, isManual } = useScale();
  const isStabilization = useMemo(() => !enableWeightCapturing && !isManual, [
    enableWeightCapturing,
    isManual,
  ]);

  const handleSubmit = async ({ newContainerWeight }: { newContainerWeight: number }) => {
    try {
      // container comes with already converted weights
      await updateEquipment({
        variables: {
          data: {
            ...omit(['__typename'], data?.equipment),
            id: containerId,
            emptyWeight: convertWeights(Number(newContainerWeight), MeasureTarget.backend),
          } as EquipmentUpdateInput,
        },
      });
    } catch (e) {
      showError(e.message);
    }
  };
  const truckWeight = useMemo(() => customerTruck?.customerTruck.emptyWeight || 0, [
    customerTruck?.customerTruck.emptyWeight,
  ]);

  const truckWeightInTons = convertKgToUom(truckWeight, UnitOfMeasurementType.ShortTons);
  const conteinerWeightInTons =
    scale.convertedMass -
    convertKgToUom(
      Number(customerTruck?.customerTruck.emptyWeight),
      UnitOfMeasurementType.ShortTons,
    );

  return (
    <Form
      initialValues={{
        truckTareWeight: truckWeight,
        newContainerWeight: scale.convertedMass * 907.2 - truckWeight,
      }}
      onSubmit={handleSubmit}
      render={({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <Box width="100%" mt={3}>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body1">{t('Weight the Container')}</Typography>
              <WeightTheContainerSvg />
            </Box>
            <Box display="flex" justifyContent="space-between" mt={2} mb={2}>
              <Typography variant="body2">
                {`${t('Truck Tare Weight')} (${massTranslation})`}
              </Typography>
              <Field name="truckTareWeight" subscription={{ value: true }}>
                {() => <Typography variant="body2">{truckWeightInTons}</Typography>}
              </Field>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography variant="body2">{`${t(
                'New Can Weight',
              )} (${massTranslation})`}</Typography>
              <Field name="newContainerWeight" subscription={{ value: true }}>
                {() => <Typography variant="body2">{mathRound2(conteinerWeightInTons)}</Typography>}
              </Field>
            </Box>
            <Box mt={2} mb={5}>
              <FormSpy
                subscription={{
                  pristine: true,
                  submitting: true,
                  validating: true,
                  invalid: true,
                  submitSucceeded: true,
                }}
              >
                {({ submitting, invalid, validating, submitSucceeded }) => (
                  <SidebarButton
                    disabled={
                      isStabilization ||
                      customerTruck?.customerTruck.type !== CustomerTruckTypes.Rolloff ||
                      !containerId ||
                      submitting ||
                      validating ||
                      invalid ||
                      submitSucceeded
                    }
                    variant="contained"
                    color="secondary"
                    key="on-submit"
                    type="submit"
                    fullWidth
                  >
                    {isStabilization && (
                      <Box position="absolute" left="5px" top="0">
                        <CircularProgress size={10} color="inherit" />
                      </Box>
                    )}
                    <CaptureWeightSvg />
                    {submitSucceeded ? t('Captured') : t('Capture Container')}
                  </SidebarButton>
                )}
              </FormSpy>
            </Box>
          </Box>
        </form>
      )}
    />
  );
};
