import React from 'react';
import { Meta, Story } from '@storybook/react/types-6-0';
import { useFormik } from 'formik';

// import { noop } from 'lodash-es';
import { FormContainer, FormInput, IFormContainer } from '../../src/common';
import { Theme } from '../Theme';

export default {
  title: 'Example/FormContainer',
  component: FormContainer,
} as Meta;

export const Overview: Story<IFormContainer> = args => {
  const formik = useFormik({
    initialValues: {
      example: '',
    },
    validateOnChange: false,
    onSubmit: e => {
      alert(JSON.stringify(e));
    },
  });

  return (
    <Theme>
      <FormContainer {...args} formik={formik}>
        <FormInput
          {...args}
          name="example"
          value={formik.values.example}
          onChange={formik.handleChange}
        />
      </FormContainer>
    </Theme>
  );
};
