import React, { useContext, useEffect, useState } from 'react';
import { Box, Divider, Typography } from '@material-ui/core';

import {
  ArrivalDateInput,
  DepartureDateInput,
  NetTimeInput,
  NetWeightInput,
  WeightInput,
} from '../../Inputs';
import { ReadOnlyOrderFormComponent } from '../../types';
import { Field, useField } from 'react-final-form';
import { ScaleWeightOutValues } from '../../Inputs/ScaleWeightOutValues';
import TareInputs from '../../components/TareInputs';
import { useCompanyMeasurementUnits } from '../../../../hooks/useCompanyMeasurementUnits';
import { Trans } from '../../../../i18n';
import { MaterialOrderContext } from '../../../../utils/contextProviders/MaterialOrderProvider';
import { HaulingMaterial } from '@starlightpro/common/graphql/api';
import {
  UnitOfMeasurementType,
  getUomTranslation,
} from '../../../../hooks/useUnitOfMeasurementConversion';

interface Props extends ReadOnlyOrderFormComponent {
  weightUOM?: UnitOfMeasurementType;
}

export const WeightOutForm: React.FC<Props> = ({ readOnly, weightUOM }) => {
  const {
    input: { value: bypassScale },
  } = useField('bypassScale', { subscription: { value: false } });
  const { massTranslation } = useCompanyMeasurementUnits();
  const uomTranslation = weightUOM ? getUomTranslation(weightUOM) : massTranslation;

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

  return (
    <Box>
      <Typography variant="h6">
        <Trans>Arrival</Trans>
      </Typography>
      <Box mb={2} />
      <ArrivalDateInput readOnly={readOnly} required />
      <WeightInput
        fieldName="weightIn"
        label={
          <Box>
            <Trans>Weight In</Trans>
            {` (${
              material?.units && !weightUOM
                ? getUomTranslation(material.units as UnitOfMeasurementType)
                : uomTranslation
            })`}
          </Box>
        }
        readOnly={readOnly}
      />
      <Divider />
      <Box mb={2} />
      <Box display="flex" justifyContent="space-between">
        <Typography variant="h6">
          <Trans>Departure</Trans>
        </Typography>
      </Box>
      <Box mb={2} />
      <DepartureDateInput readOnly={readOnly} required />
      {!bypassScale && (
        <Field name="useTare" subscription={{ value: true }}>
          {({ input: { value: useTare } }) =>
            useTare ? (
              <TareInputs readOnly={readOnly} />
            ) : (
              <>
                <WeightInput
                  fieldName="weightOut"
                  label={
                    <Box>
                      <Trans>Weight Out</Trans>{' '}
                      {` (${
                        material?.units && !weightUOM
                          ? getUomTranslation(material.units as UnitOfMeasurementType)
                          : uomTranslation
                      })`}
                    </Box>
                  }
                  readOnly={readOnly}
                  isScaleValueChange
                />
                <ScaleWeightOutValues readOnly={readOnly} />
              </>
            )
          }
        </Field>
      )}
      <Divider />
      <Box mb={2} />
      <Typography variant="h6">
        <Trans>Net</Trans>
      </Typography>
      <Box mb={2} />
      <Box display="flex" flexDirection="row" justifyContent="space-between">
        <Box display="flex" flexGrow={1} pr={4} maxWidth={412}>
          <NetTimeInput />
        </Box>
        <Box>
          <NetWeightInput weightUOM={weightUOM} />
        </Box>
      </Box>
    </Box>
  );
};
