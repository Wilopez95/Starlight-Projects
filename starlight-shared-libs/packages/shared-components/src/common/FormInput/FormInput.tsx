import React, { useCallback } from 'react';
import { useFormikContext } from 'formik';

import { TextInput } from '../TextInput/TextInput';
import { ITextInput } from '../TextInput/types';

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
