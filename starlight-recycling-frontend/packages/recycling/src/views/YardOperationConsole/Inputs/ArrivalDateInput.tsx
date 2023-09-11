import React from 'react';
import { ReadOnlyOrderFormComponent } from '../types';
import { DateAndTimeInputInput } from './DateAndTimeInput';
import { Field } from 'react-final-form';

interface Props extends ReadOnlyOrderFormComponent {
  required?: boolean;
}

export const ArrivalDateInput: React.FC<Props> = ({ readOnly, required }) => {
  return (
    <Field name="arrivedAt" subsscription={{ value: true }}>
      {({ input }) => (
        <DateAndTimeInputInput
          name="arrivedAt"
          readOnly={readOnly}
          required={required}
          maxDate={input.value}
        />
      )}
    </Field>
  );
};
