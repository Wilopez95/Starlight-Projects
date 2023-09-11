import { FC, useEffect } from 'react';

import { useScale } from '../../../hooks/useScale';
import { useField, useForm } from 'react-final-form';
import { isNil } from 'lodash-es';
import { MeasurementType, MeasurementUnit } from '../../../graphql/api';

export interface ScaleWeightInValuesProps {
  defaultScaleId?: number;
  allowOverride?: boolean;
}

export const ScaleWeightInValues: FC<ScaleWeightInValuesProps> = ({
  defaultScaleId,
  allowOverride = false,
}) => {
  const {
    convertedMass,
    scaleId,
    reportedTimestamp,
    setScaleConfigurationId,
    isManual,
  } = useScale();
  const form = useForm();
  const {
    meta: { initial },
    input: { value },
  } = useField('weightIn', { subscription: { initial: true, value: true } });

  useEffect(() => {
    if (defaultScaleId) {
      setScaleConfigurationId(defaultScaleId);
    }
  }, [defaultScaleId, setScaleConfigurationId]);

  useEffect(() => {
    if ((!allowOverride && !isNil(initial)) || isManual) {
      return;
    }

    form.batch(() => {
      form.change('weightIn', convertedMass);
      form.change('weightInSource', scaleId);
      form.change('weightInTimestamp', reportedTimestamp);
      form.change('weightInType', MeasurementType.Hardware);
      form.change('weightInUnit', MeasurementUnit.Kilogram);
    });
  }, [allowOverride, form, convertedMass, scaleId, reportedTimestamp, value, initial, isManual]);

  return null;
};
