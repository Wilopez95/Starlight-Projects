import React, { FC, useContext, useEffect, useState } from 'react';
import { useTranslation } from '../../../../i18n';
import { Box, Divider, Grid, Typography } from '@material-ui/core';

import {
  ArrivalDateInput,
  MiscellaneousItemsInput,
  MaterialDistributionInput,
  WeightInput,
} from '../../Inputs';
import { ImagesContainer } from './ImagesContainer';
import { ScaleWeightInValues } from '../../Inputs/ScaleWeightInValues';
import { useCompanyMeasurementUnits } from '../../../../hooks/useCompanyMeasurementUnits';
import { MaterialOrderContext } from '../../../../utils/contextProviders/MaterialOrderProvider';
import { UnitOfMeasurementType } from '../../../../constants/unitOfMeasurement';
import { HaulingMaterial, Maybe } from '@starlightpro/common/graphql/api';
import { getUomTranslation } from '../../../../hooks/useUnitOfMeasurementConversion';

export interface DumpDetailsFormProps {
  orderId: number;
  weightScaleUom?: Maybe<string> | undefined;
}

export const DumpDetailsForm: FC<DumpDetailsFormProps> = ({ orderId, weightScaleUom }) => {
  const { massTranslation } = useCompanyMeasurementUnits();
  const { t } = useTranslation();

  const materialContext = useContext(MaterialOrderContext);

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

  const selectedUom = weightScaleUom || material?.units;

  return (
    <Box>
      <Typography variant="h6">{t('Arrival')}</Typography>
      <Box mb={2} />
      <ArrivalDateInput required />
      <WeightInput
        fieldName="weightIn"
        label={`${t('Weight In ')} (${
          selectedUom ? getUomTranslation(selectedUom as UnitOfMeasurementType) : massTranslation
        })`}
        isScaleValueChange
      />
      <ScaleWeightInValues />
      <Divider />
      <Box mb={2} />
      <Box>
        <Grid container spacing={4}>
          <Grid item xs={6}>
            <MaterialDistributionInput />
          </Grid>
          <Grid item xs={6}>
            <MiscellaneousItemsInput />
          </Grid>
        </Grid>
        <Divider />
        <Box mb={3} />
        <ImagesContainer orderId={orderId} />
      </Box>
    </Box>
  );
};
