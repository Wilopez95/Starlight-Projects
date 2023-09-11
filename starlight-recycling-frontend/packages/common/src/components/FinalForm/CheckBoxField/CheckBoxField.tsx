import React, { memo } from 'react';
import { useField } from 'react-final-form';
import CommonCheckboxField, {
  CheckBoxFieldProps as CommonCheckBoxFieldProps,
} from '../../CheckBoxField';

export interface CheckBoxFieldProps extends CommonCheckBoxFieldProps {
  name: string;
}

export const CheckBoxField = memo<CheckBoxFieldProps>(({ name, value, ...props }) => {
  const { input } = useField(name, {
    type: 'checkbox',
    value: value,
    subscription: { value: true },
  });

  return <CommonCheckboxField {...input} {...props} />;
});

export default CheckBoxField;
