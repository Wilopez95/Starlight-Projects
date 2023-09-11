import React, { memo } from 'react';
import { Field } from 'react-final-form';
import RadioGroupItemCommon, {
  RadioGroupItemProps as RadioGroupItemCommonProps,
} from '../../RadioGroup/RadioGroupItem';

export interface RadioGroupItemProps extends RadioGroupItemCommonProps {}

// name will be populated from RadioGroup or passed in props directly
export const RadioGroupItem = memo<RadioGroupItemCommonProps>((props) => {
  return (
    <Field name={props.name as string} type="radio" value={props.value}>
      {({ input }) => <RadioGroupItemCommon {...props} {...input} />}
    </Field>
  );
});

export default RadioGroupItem;
