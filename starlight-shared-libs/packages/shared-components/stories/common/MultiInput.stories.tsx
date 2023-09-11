import React from 'react';
import { Meta, Story } from '@storybook/react/types-6-0';
import { FormikProvider, useFormik } from 'formik';
import { noop } from 'lodash-es';
import validator from 'validator';

import { IMultiInput, MultiInput } from '../../src/common';
import { Theme } from '../Theme';

export default {
  title: 'Example/MultiInput',
  component: MultiInput,
} as Meta;

export const Overview: Story<IMultiInput> = args => {
  const formik = useFormik({
    initialValues: { example: ['user@gmail1.com', 'user@gmail2.com', 'user3@gmail1.com'] },
    validateOnChange: false,
    initialErrors: {},
    onSubmit: noop,
  });
  const { values, errors, setFieldValue } = formik;

  return (
    <Theme>
      <FormikProvider value={formik}>
        <MultiInput
          {...args}
          name="example"
          id="example"
          entity="example"
          label="Example"
          error={errors.example as string}
          validationRule={validator.isEmail}
          values={values.example}
          onChange={setFieldValue}
        />
      </FormikProvider>
    </Theme>
  );
};
