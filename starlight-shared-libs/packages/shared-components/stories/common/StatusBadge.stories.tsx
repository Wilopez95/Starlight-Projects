import React from 'react';
import { Meta, Story } from '@storybook/react/types-6-0';

import { StatusBadge } from '../../src/common';
import { Theme } from '../Theme';

export default {
  title: 'Example/StatusBadge',
  component: StatusBadge,
} as Meta;

const Template: Story = args => (
  <Theme>
    <StatusBadge {...args} />
  </Theme>
);

export const Overview = Template.bind({});
Overview.args = {
  active: true,
};
