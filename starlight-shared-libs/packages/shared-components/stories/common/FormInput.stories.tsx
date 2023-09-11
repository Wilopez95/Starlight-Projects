import React from 'react';
import { Meta, Story } from '@storybook/react/types-6-0';
import { useFormik } from 'formik';
import { noop } from 'lodash-es';

import { FormInput, ITextInput } from '../../src/common';
import { Theme } from '../Theme';

export default {
  title: 'Example/FormInput',
  component: FormInput,
} as Meta;

export const Overview: Story<ITextInput> = args => {
  const { values, handleChange } = useFormik({
    initialValues: {
      example: '',
    },
    validateOnChange: false,
    onSubmit: noop,
  });

  return (
    <Theme>
      <FormInput
        {...args}
        name="example"
        label="test"
        value={values.example}
        onChange={handleChange}
      />
    </Theme>
  );
};
