import React from 'react';
import { Meta, Story } from '@storybook/react/types-6-0';

import { ITimePicker, TimePicker } from '../../src/common';
import { Theme } from '../Theme';

export default {
  title: 'Example/TimePicker',
  component: TimePicker,
} as Meta;

const Template: Story<ITimePicker> = args => (
  <Theme>
    <div>
      <TimePicker {...args} />
    </div>
  </Theme>
);

export const Overview = Template.bind({});
Overview.args = {
  label: 'Custom text',
  defaultValue: new Date(),
};
