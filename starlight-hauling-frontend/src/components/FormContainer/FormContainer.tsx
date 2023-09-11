import React from 'react';
import { FormikProvider } from 'formik';

import { Form } from './styles';
import { IFormContainer } from './types';

const FormContainer: React.FC<IFormContainer> = ({
  formik,
  children,
  className,
  noValidate = false,
  fullHeight = false,
}) => {
  return (
    <FormikProvider value={formik}>
      <Form
        onSubmit={formik.handleSubmit}
        onReset={formik.handleReset}
        noValidate={noValidate}
        className={className}
        fullHeight={fullHeight}
      >
        {children}
      </Form>
    </FormikProvider>
  );
};

export default FormContainer;
