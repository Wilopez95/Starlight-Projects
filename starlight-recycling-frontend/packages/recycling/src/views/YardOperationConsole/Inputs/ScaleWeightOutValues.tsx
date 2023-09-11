import { FC, useEffect } from 'react';
import { useScale } from '../../../hooks/useScale';
import { useField, useForm, useFormState } from 'react-final-form';
import { MeasurementType, MeasurementUnit } from '../../../graphql/api';
import { ReadOnlyOrderFormComponent } from '../types';

export interface ScaleWeightOutValuesProps extends ReadOnlyOrderFormComponent {}

export const ScaleWeightOutValues: FC<ScaleWeightOutValuesProps> = ({ readOnly }) => {
  const { convertedMass, scaleId, reportedTimestamp, isManual } = useScale();
  const form = useForm();
  const {
    meta: { initial },
    input: { value },
  } = useField('weightOut', { subscription: { initial: true, value: true } });
  const { submitting } = useFormState({ subscription: { submitting: true } });

  useEffect(() => {
    if (readOnly || submitting || isManual || (initial != null && initial !== 0)) {
      return;
    }

    form.batch(() => {
      form.change('weightOut', convertedMass);
      form.change('weightOutSource', scaleId);
      form.change('weightOutTimestamp', reportedTimestamp);
      form.change('weightOutType', MeasurementType.Hardware);
      form.change('weightOutUnit', MeasurementUnit.Kilogram);
    });
  }, [
    readOnly,
    form,
    convertedMass,
    scaleId,
    reportedTimestamp,
    value,
    initial,
    submitting,
    isManual,
  ]);

  return null;
};
