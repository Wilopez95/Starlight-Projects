import React from 'react';
import { Meta, Story } from '@storybook/react/types-6-0';
import { useFormik } from 'formik';
import { noop } from 'lodash-es';

import { IRadioButton, RadioButton } from '../../src/common';
import { Theme } from '../Theme';

export default {
  title: 'Example/RadioButton',
  component: RadioButton,
} as Meta;

export const Overview: Story<IRadioButton> = args => {
  const { values, handleChange } = useFormik({
    initialValues: {
      example: false,
    },
    validateOnChange: false,
    onSubmit: noop,
  });

  return (
    <Theme>
      <RadioButton
        {...args}
        name="example"
        disabled={false}
        value={values.example}
        onChange={handleChange}
      />
    </Theme>
  );
};
