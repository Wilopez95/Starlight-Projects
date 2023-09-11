import React from 'react';
import { Meta, Story } from '@storybook/react/types-6-0';
import { useFormik } from 'formik';
import { noop } from 'lodash-es';

import { ITextInput, TextInput } from '../../src/common';
import { Theme } from '../Theme';

export default {
  title: 'Example/TextInput',
  component: TextInput,
} as Meta;

export const Overview: Story<ITextInput> = args => {
  const { values, handleChange } = useFormik({
    initialValues: {
      example: 'ddd',
    },
    validateOnChange: false,
    onSubmit: noop,
  });

  return (
    <Theme>
      <TextInput {...args} name="example" value={values.example} onChange={handleChange} />
    </Theme>
  );
};
