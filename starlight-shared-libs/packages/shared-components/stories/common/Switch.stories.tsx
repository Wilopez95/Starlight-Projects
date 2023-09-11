import React from 'react';
import { Meta, Story } from '@storybook/react/types-6-0';
import { FormikProvider, useFormik } from 'formik';
import { noop } from 'lodash-es';

import { ISwitch, Switch } from '../../src/common';
import { Theme } from '../Theme';

export default {
  title: 'Example/Switch',
  component: Switch,
} as Meta;

export const Template: Story<ISwitch> = () => {
  const formik = useFormik({
    initialValues: { switch: false },
    validateOnChange: false,
    initialErrors: {},
    onSubmit: noop,
  });
  const { values, setFieldValue } = formik;

  return (
    <Theme>
      <FormikProvider value={formik}>
        <Switch
          name="switch"
          onChange={() => setFieldValue('switch', !values.switch)}
          value={values.switch}
        >
          Test Text
        </Switch>
      </FormikProvider>
    </Theme>
  );
};

export const Overview = Template.bind({});
