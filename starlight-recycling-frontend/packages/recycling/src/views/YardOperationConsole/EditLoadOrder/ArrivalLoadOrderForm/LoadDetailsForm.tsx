import React, { FC } from 'react';
import { Trans, useTranslation } from '../../../../i18n';
import { Box, Typography } from '@material-ui/core';

import { ArrivalDateInput, WeightInput } from '../../Inputs';
import { ScaleWeightInValues } from '../../Inputs/ScaleWeightInValues';
import { ReadOnlyOrderFormComponent } from '../../types';
import TareInputs from '../../components/TareInputs';
import { Field, useField } from 'react-final-form';
import { useCompanyMeasurementUnits } from '../../../../hooks/useCompanyMeasurementUnits';
import { UnitOfMeasurementType } from '../../../../constants/unitOfMeasurement';
import { getUomTranslation } from '../../../../hooks/useUnitOfMeasurementConversion';

export interface LoadDetailsFormProps extends ReadOnlyOrderFormComponent {
  useScaleWeightInValues?: boolean;
  weightUOM?: UnitOfMeasurementType;
}

export const LoadDetailsForm: FC<LoadDetailsFormProps> = ({
  readOnly,
  useScaleWeightInValues,
  weightUOM,
}) => {
  const { massTranslation } = useCompanyMeasurementUnits();
  const { t } = useTranslation();
  const {
    input: { value: bypassScale },
  } = useField('bypassScale', { subscription: { value: true } });

  let usedUOM = weightUOM ? getUomTranslation(weightUOM) : massTranslation;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between">
        <Typography variant="h6">
          <Trans>Arrival</Trans>
        </Typography>
      </Box>
      <Box mb={2} />
      <ArrivalDateInput required readOnly={readOnly} />
      <Field name="useTare" subscription={{ value: true }}>
        {({ input: { value: useTare } }) =>
          useTare ? (
            <TareInputs readOnly={readOnly} />
          ) : (
            !bypassScale && (
              <>
                <WeightInput
                  fieldName="weightIn"
                  label={`${t('Weight In')} (${usedUOM})`}
                  isScaleValueChange
                  readOnly={readOnly}
                />
                {useScaleWeightInValues && <ScaleWeightInValues />}
              </>
            )
          )
        }
      </Field>
    </Box>
  );
};
