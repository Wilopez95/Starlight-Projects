import React, { useCallback, useEffect, useRef } from 'react';
import cx from 'classnames';
import { useFormikContext } from 'formik';

import { ICustomInput } from './types';

export const CustomInput: React.FC<ICustomInput> = ({
  children,
  id,
  checkmarkClass,
  labelClass,
  inputClass,
  readOnly,
  error,
  focus,
  name,
  onChange,
  indeterminate,
  tabIndex = 0,
  title,
  ...baseInputProps
}) => {
  const input = useRef<HTMLInputElement>(null);
  const label = useRef<HTMLLabelElement>(null);
  const formikContext = useFormikContext();

  const handleFocus = useCallback(() => {
    if (formikContext) {
      const { setFieldError } = formikContext;

      setFieldError(name, undefined);
    }
    input.current?.focus();
  }, [formikContext, name]);

  const handleKeyToggle = useCallback(event => {
    if (event.nativeEvent.code === 'Tab' && label.current) {
      label.current.style.outline = '1px solid var(--primary)';
    }
  }, []);

  const handleInputBlur = useCallback(() => {
    if (label.current) {
      label.current.style.outline = 'none';
    }
  }, []);

  useEffect(() => {
    if (input.current) {
      input.current.indeterminate = !!indeterminate;
    }
  }, [indeterminate]);

  return (
    <label
      className={labelClass}
      htmlFor={id}
      tabIndex={tabIndex}
      onFocus={handleFocus}
      data-skip-event
      title={error ?? title}
      ref={label}
      onBlur={readOnly ? undefined : handleInputBlur}
    >
      <input
        ref={input}
        id={id}
        className={cx(inputClass, {
          error,
          focus,
        })}
        data-error={checkmarkClass ? undefined : error}
        readOnly={readOnly}
        name={name}
        onChange={readOnly ? undefined : onChange}
        onKeyUp={readOnly ? undefined : handleKeyToggle}
        {...baseInputProps}
      />
      {checkmarkClass ? <div className={checkmarkClass} data-error={error} /> : null}
      {children}
    </label>
  );
};
