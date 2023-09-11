import React from 'react';
import { Meta, Story } from '@storybook/react/types-6-0';
import { useFormik } from 'formik';
import { noop } from 'lodash-es';

import { Checkbox, ICheckbox } from '../../src/common';
import { Theme } from '../Theme';

export default {
  title: 'Example/Checkbox',
  component: Checkbox,
} as Meta;

export const Overview: Story<ICheckbox> = args => {
  const { values, handleChange } = useFormik({
    initialValues: {
      example: true,
    },
    validateOnChange: false,
    onSubmit: noop,
  });

  return (
    <Theme>
      <Checkbox {...args} name="example" value={values.example} onChange={handleChange}>
        Label Text
      </Checkbox>
    </Theme>
  );
};
