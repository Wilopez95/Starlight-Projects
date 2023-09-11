import React, { useCallback } from 'react';
import { Meta, Story } from '@storybook/react/types-6-0';
import { addDays, endOfDay } from 'date-fns';
import { useFormik } from 'formik';
import { noop } from 'lodash-es';

import { Calendar, ICalendar } from '../../src/common';
import { Theme } from '../Theme';

export default {
  title: 'Example/Calendar',
  component: Calendar,
} as Meta;

export const Overview: Story<ICalendar> = args => {
  const { setFieldValue } = useFormik({
    initialValues: {},
    validateOnChange: false,
    onSubmit: noop,
  });

  const handleDateChange = useCallback(
    (name: string, date: Date | null) => {
      setFieldValue(name, endOfDay(date ?? new Date()));
    },
    [setFieldValue],
  );

  return (
    <Theme>
      <Calendar
        {...args}
        withInput
        name="calendar"
        placeholder="Select date"
        dateFormat=""
        minDate={new Date()}
        maxDate={addDays(new Date(), 5)}
        onDateChange={handleDateChange}
      />
    </Theme>
  );
};
