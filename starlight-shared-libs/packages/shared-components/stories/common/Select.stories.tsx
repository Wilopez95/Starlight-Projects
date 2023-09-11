import React from 'react';
import { Meta, Story } from '@storybook/react/types-6-0';
import { getIn, useFormik } from 'formik';
import { noop } from 'lodash-es';

import { ISelect, ISelectOption, Select } from '../../src/common';
import { Theme } from '../Theme';

export default {
  title: 'Example/Select',
  component: Select,
} as Meta;

const months: ISelectOption[] = [
  {
    label: 'January',
    value: '01',
  },
  {
    label: 'February',
    value: '02',
  },
  {
    label: 'March',
    value: '03',
  },
  {
    label: 'April',
    value: '04',
  },
  {
    label: 'May',
    value: '05',
  },
  {
    label: 'June',
    value: '06',
  },
  {
    label: 'July',
    value: '07',
  },
  {
    label: 'August',
    value: '08',
  },
  {
    label: 'September',
    value: '09',
  },
  {
    label: 'October',
    value: '10',
  },
  {
    label: 'November',
    value: '11',
  },
  {
    label: 'December',
    value: '12',
  },
];

export const Overview: Story<ISelect> = args => {
  const { values, errors, setFieldValue } = useFormik({
    initialValues: {
      expirationMonth: '01',
    },
    validateOnChange: false,
    onSubmit: noop,
  });

  return (
    <Theme>
      <Select
        {...args}
        label="Expiration Date"
        name="expirationMonth"
        options={months}
        value={getIn(values, 'expirationMonth')}
        error={getIn(errors, 'expirationMonth')}
        onSelectChange={setFieldValue}
      />
    </Theme>
  );
};
