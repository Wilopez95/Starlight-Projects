import React from 'react';
import { Box, Divider, Typography } from '@material-ui/core';

import {
  DepartureDateInput,
  DestinationInput,
  MaterialInput,
  NetTimeInput,
  NetWeightInput,
  WeightInput,
} from '../../Inputs';
import { ReadOnlyOrderFormComponent } from '../../types';
import { ScaleWeightOutValues } from '../../Inputs/ScaleWeightOutValues';
import { useTranslation } from 'react-i18next';
import { LoadDetailsForm } from '../ArrivalLoadOrderForm/LoadDetailsForm';
import { useCompanyMeasurementUnits } from '../../../../hooks/useCompanyMeasurementUnits';
import { UnitOfMeasurementType } from '../../../../constants/unitOfMeasurement';
import { getUomTranslation } from '../../../../hooks/useUnitOfMeasurementConversion';

interface Props extends ReadOnlyOrderFormComponent {
  showMaterialAndDestination?: boolean;
  weightUOM?: UnitOfMeasurementType;
}

export const OrderLoadForm: React.FC<Props> = ({
  readOnly,
  showMaterialAndDestination,
  weightUOM,
}) => {
  const { t } = useTranslation();
  const { massTranslation } = useCompanyMeasurementUnits();

  let usedUOM = weightUOM ? getUomTranslation(weightUOM) : massTranslation;

  return (
    <Box mt={2}>
      <LoadDetailsForm readOnly={readOnly} weightUOM={weightUOM} />
      <Divider />
      <Box mb={2} />
      <Typography variant="h6">{t('Departure')}</Typography>
      <DepartureDateInput readOnly={readOnly} />
      <WeightInput
        fieldName="weightOut"
        label={`${t('Weight Out')} (${usedUOM})`}
        readOnly={readOnly}
        isScaleValueChange
      />
      <ScaleWeightOutValues readOnly={readOnly} />
      <Divider />
      <Box mb={2} />
      <Typography variant="h6">{t('Net')}</Typography>
      <Box display="flex" flexDirection="row" justifyContent="space-between">
        <Box display="flex" flexGrow={1} pr={4} maxWidth={412}>
          <NetTimeInput />
        </Box>
        <NetWeightInput weightUOM={weightUOM} />
      </Box>
      {showMaterialAndDestination && (
        <>
          <Typography variant="h6">{t('Load')}</Typography>
          <MaterialInput readOnly={readOnly} updateContext={true} />
          <DestinationInput readOnly={readOnly} />
        </>
      )}
    </Box>
  );
};
