import React, { memo, useState, useMemo } from 'react';
import { debounce } from 'lodash-es';
import { useField, Field } from 'react-final-form';
import CommonCheckboxGroup, {
  CheckboxGroupProps as CommonCheckboxGroupProps,
} from '../../CheckboxGroup';

export interface CheckboxGroupFieldProps extends CommonCheckboxGroupProps {
  name: string;
}

export const CheckboxGroupField = memo<CheckboxGroupFieldProps>((props) => {
  const { name } = props;
  const { input } = useField(name, { type: 'radio', subscription: { value: true } });
  const [touched, setTouched] = useState<boolean | undefined>(undefined);
  const [error, setError] = useState<string | undefined>();
  const debouncedSetTouched = useMemo(() => {
    return debounce((nextTouched: boolean | undefined) => {
      if (nextTouched !== touched) {
        setTouched(nextTouched);
      }
    }, 200);
  }, [touched, setTouched]);
  const debouncedSetError = useMemo(() => {
    return debounce((nextError: string | undefined) => {
      if (nextError !== error) {
        setError(nextError);
      }
    }, 200);
  }, [setError, error]);
  const debouncedMeta = (
    <Field name={name} subscription={{ touched: true, error: true, submitError: true }}>
      {({ meta }) => {
        debouncedSetError(meta.error || meta.submitError);
        debouncedSetTouched(meta.touched);
      }}
    </Field>
  );

  return (
    <>
      {debouncedMeta}
      <CommonCheckboxGroup {...props} {...input} touched={touched} error={error} />
    </>
  );
});

export default CheckboxGroupField;
