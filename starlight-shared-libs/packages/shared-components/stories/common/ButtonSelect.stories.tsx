import React from 'react';
import { Meta, Story } from '@storybook/react/types-6-0';
import { getIn, useFormik } from 'formik';
import { noop } from 'lodash-es';

import { ButtonSelect, IButtonSelect, Option } from '../../src/common';
import { Theme } from '../Theme';

export default {
  title: 'Example/ButtonSelect',
  component: ButtonSelect,
} as Meta;

const timeItems: Option<string, string>[] = [
  { label: 'Anytime', value: 'any' },
  { label: 'AM', value: 'am' },
  { label: 'PM', value: 'pm' },
  { label: 'Specific', value: 'specific' },
];

export const Overview: Story<IButtonSelect> = args => {
  const { values, handleChange } = useFormik({
    initialValues: {
      bestTimeToCome: 'am',
    },
    validateOnChange: false,
    onSubmit: noop,
  });

  return (
    <Theme>
      <ButtonSelect
        {...args}
        label="Best time for a driver to come"
        items={timeItems}
        name="bestTimeToCome"
        value={getIn(values, 'bestTimeToCome')}
        onSelectionChange={handleChange}
      />
    </Theme>
  );
};
