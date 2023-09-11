import React, { FC, useEffect, useMemo } from 'react';
import { useTranslation } from '../../../../../i18n';
import { omit } from 'lodash/fp';
import { Box, CircularProgress, Typography } from '@material-ui/core';
import { Field, Form, FormSpy } from 'react-final-form';

import {
  CustomerTruckUpdateInput,
  MeasurementType,
  MeasurementUnit,
  useGetCustomerTruckLazyQuery,
  useGetEquipmentItemLazyQuery,
  useUpdateCustomerTruckMutation,
} from '../../../../../graphql/api';
import { SidebarButton } from './SidebarButton';
import { CaptureWeightSvg } from '../Images/CaptureWeightSvg';
import { WeightTheTruckSvg } from '../Images/WeightTheTruckSvg';
import { useScale } from '../../../../../hooks/useScale';
import { useCompanyMeasurementUnits } from '../../../../../hooks/useCompanyMeasurementUnits';
import { mathRound2 } from '../../../../../utils/mathRound';
import {
  convertKgToUom,
  UnitOfMeasurementType,
} from '../../../../../hooks/useUnitOfMeasurementConversion';
interface Props {
  customerTruckId: number;
  containerId: number;
}

export const TruckWeight: FC<Props> = ({ customerTruckId, containerId }) => {
  const [getEquipmentItem, { data: container }] = useGetEquipmentItemLazyQuery({
    fetchPolicy: 'no-cache',
  });
  const [getCustomerTruck, { data }] = useGetCustomerTruckLazyQuery({
    fetchPolicy: 'no-cache',
  });
  const [updateCustomerTruck] = useUpdateCustomerTruckMutation();
  const scale = useScale();
  const { t } = useTranslation();
  const { massTranslation } = useCompanyMeasurementUnits();

  useEffect(() => {
    if (containerId) {
      getEquipmentItem({ variables: { id: Number(containerId) } });
    }
  }, [containerId, getEquipmentItem]);

  useEffect(() => {
    if (customerTruckId) {
      getCustomerTruck({ variables: { id: Number(customerTruckId) } });
    }
  }, [customerTruckId, getCustomerTruck]);

  const handleSubmit = ({ newTruckWeight }: { newTruckWeight: number }) => {
    const customerTruck = omit(['__typename'], data?.customerTruck);

    updateCustomerTruck({
      variables: {
        data: {
          ...customerTruck,
          id: customerTruckId,
          emptyWeight: newTruckWeight,
          emptyWeightSource: scale.scaleId,
          emptyWeightTimestamp: scale.reportedTimestamp,
          emptyWeightType: MeasurementType.Hardware,
          emptyWeightUnit: MeasurementUnit.Kilogram,
        } as CustomerTruckUpdateInput,
      },
    });
  };

  const containerWeight = useMemo(() => container?.equipment.emptyWeight || 0, [
    container?.equipment.emptyWeight,
  ]);

  const containerWeightInTons = convertKgToUom(containerWeight, UnitOfMeasurementType.ShortTons);
  const containerWeightResult = scale.convertedMass - containerWeightInTons;

  const { enableWeightCapturing, isManual } = useScale();
  const isStabilization = useMemo(() => !enableWeightCapturing && !isManual, [
    enableWeightCapturing,
    isManual,
  ]);

  return (
    <Form
      initialValues={{
        containerTareWeight: containerWeight,
        newTruckWeight: scale.convertedMass * 907.2 - containerWeight,
      }}
      onSubmit={handleSubmit}
      render={({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <Box width="100%" mt={5}>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body1">{t('Weight the Truck')}</Typography>
              <WeightTheTruckSvg />
            </Box>
            <Box display="flex" justifyContent="space-between" mt={2} mb={2}>
              <Typography variant="body2">
                {`${t('Container Tare Weight')} (${massTranslation})`}
              </Typography>
              <Field name="containerTareWeight" subscription={{ value: true }}>
                {() => <Typography variant="body2">{containerWeightInTons}</Typography>}
              </Field>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography variant="body2">
                {`${t('New Truck Weight')} (${massTranslation})`}
              </Typography>
              <Field name="newTruckWeight" subscription={{ value: true }}>
                {() => <Typography variant="body2">{mathRound2(containerWeightResult)}</Typography>}
              </Field>
            </Box>
            <Box mt={2} mb={3}>
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
                      isStabilization || submitting || validating || invalid || submitSucceeded
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
                    {submitSucceeded ? t('Captured') : t('Capture Truck')}
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
