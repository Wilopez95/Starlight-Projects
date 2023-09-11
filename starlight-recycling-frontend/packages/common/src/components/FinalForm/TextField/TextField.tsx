import { has, isObject, isEmpty } from 'lodash-es';
import React, { memo, useState, useMemo, useCallback } from 'react';
import { debounce } from 'lodash-es';
import { useField, Field } from 'react-final-form';
import CommonTextField, { TextFieldProps as CommonTextFieldProps } from '../../TextField';

export interface TextFieldProps extends CommonTextFieldProps {
  name: string;
  variant?: CommonTextFieldProps['variant'];
  classes?: any;
  mapValues?: {
    mapFieldValueToFormValue: (value: any) => any;
    mapFormValueToFieldValue: (value: any) => any;
  };
}

const defaultSelectMapValues = {
  mapFieldValueToFormValue: (v: any) => (has(v, 'value') ? v.value : v),
  mapFormValueToFieldValue: (v: unknown) => v,
};
const defaultMapValues = {
  mapFieldValueToFormValue: (v: any) => v,
  mapFormValueToFieldValue: (v: unknown) => v,
};

export const TextField = memo<TextFieldProps>((props) => {
  const { name, type } = props;
  const { mapValues: mapValuesProp, ...textFieldProps } = props;
  const mapValues = mapValuesProp || (props.select ? defaultSelectMapValues : defaultMapValues);
  const { input } = useField(name, { type: type || 'text', subscription: { value: true } });
  const [touched, setTouched] = useState<boolean | undefined>(undefined);
  const [error, setError] = useState<object | string | undefined | null>();
  const debouncedSetTouched = useMemo(() => {
    return debounce((nextTouched: boolean | undefined) => {
      if (nextTouched !== touched) {
        setTouched(nextTouched);
      }
    }, 200);
  }, [touched, setTouched]);
  const debouncedSetError = useMemo(() => {
    return debounce((nextError: object | string | undefined) => {
      if (nextError !== error) {
        setError(nextError);
      }
    }, 200);
  }, [error]);
  const onChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (props.onChange) {
        props.onChange(event);
      }

      let nextValue = mapValues.mapFieldValueToFormValue(event.target.value);

      if (textFieldProps.type === 'number') {
        try {
          nextValue = parseFloat(nextValue);
        } catch {}
      }

      input.onChange({
        target: {
          name,
          value: nextValue,
        },
      });
    },
    [input, mapValues, name, props, textFieldProps.type],
  );
  const value = useMemo(() => {
    return mapValues.mapFormValueToFieldValue(input.value);
  }, [input.value, mapValues]);

  const errorComponent = useMemo(() => {
    if (isEmpty(error)) {
      return null;
    }

    if (isObject(error)) {
      const entries = Object.entries(error);

      return entries[0][1];
    }

    return error;
  }, [error]);

  return (
    <>
      <Field
        name={name}
        subscription={{ touched: true, error: true, submitError: true, dirtySinceLastSubmit: true }}
      >
        {({ meta }) => {
          const { error, submitError, dirtySinceLastSubmit, touched } = meta;

          debouncedSetError(error || (!dirtySinceLastSubmit && submitError) || null);
          debouncedSetTouched(submitError ? true : touched);
        }}
      </Field>
      <CommonTextField
        {...textFieldProps}
        {...input}
        value={value}
        onChange={onChange}
        touched={touched}
        error={!props.disabled && errorComponent}
      />
    </>
  );
});

export default TextField;
