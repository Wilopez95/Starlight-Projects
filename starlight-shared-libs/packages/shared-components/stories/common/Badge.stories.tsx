import React from 'react';
import { Meta, Story } from '@storybook/react/types-6-0';

import { Badge, IBadge } from '../../src/common';
import { Theme } from '../Theme';

export default {
  title: 'Example/Badge',
  component: Badge,
} as Meta;

const Template: Story<IBadge> = args => (
  <Theme>
    <Badge {...args}>Text in badge</Badge>
  </Theme>
);

export const Overview = Template.bind({});
Overview.args = {
  borderRadius: 8,
};
