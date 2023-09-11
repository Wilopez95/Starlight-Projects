import React from 'react';
import { Meta, Story } from '@storybook/react/types-6-0';
import { useFormik } from 'formik';
import { noop } from 'lodash-es';

import { IMaskedTextInput, MaskedTextInput } from '../../src/common';
import { Theme } from '../Theme';

export default {
  title: 'Example/MaskedTextInput',
  component: MaskedTextInput,
} as Meta;

const Template: Story<IMaskedTextInput> = args => {
  const { values, handleChange } = useFormik({
    initialValues: {
      example: '',
    },
    validateOnChange: false,
    onSubmit: noop,
  });

  return (
    <Theme>
      <MaskedTextInput {...args} name="example" onChange={handleChange} value={values.example} />
    </Theme>
  );
};

export const Overview = Template.bind({});
Overview.args = {
  maskChar: 'X',
  label: 'Card Number',
  mask: '9999-9999-9999-9999',
  alwaysShowMask: true,
  type: 'number',
};
