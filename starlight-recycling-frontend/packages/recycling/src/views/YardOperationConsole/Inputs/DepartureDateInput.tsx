import React from 'react';
import { ReadOnlyOrderFormComponent } from '../types';
import { DateAndTimeInputInput } from './DateAndTimeInput';
import { Field } from 'react-final-form';

interface Props extends ReadOnlyOrderFormComponent {
  required?: boolean;
}

export const DepartureDateInput: React.FC<Props> = ({ readOnly, required }) => {
  return (
    <Field name="departureAt" subsscription={{ value: true }}>
      {({ input }) => (
        <DateAndTimeInputInput
          name="departureAt"
          readOnly={readOnly}
          required={required}
          minDate={input.value}
        />
      )}
    </Field>
  );
};
