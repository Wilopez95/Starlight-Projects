import React, { useCallback } from 'react';
import { ITextInput, TextInput } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';

export const FormInput: React.FC<ITextInput> = ({ children, ...props }) => {
  const { name } = props;
  const formikContext = useFormikContext();

  const handleClearError = useCallback(() => {
    if (formikContext) {
      const { setFieldError } = formikContext;

      setFieldError(name, undefined);
    }
  }, [name, formikContext]);

  return (
    <TextInput onClearError={handleClearError} {...props}>
      {children}
    </TextInput>
  );
};
