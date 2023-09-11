import React from 'react';
import { Meta, Story } from '@storybook/react/types-6-0';

import { DescriptiveTooltip, ITooltip } from '../../src/common';
import { Theme } from '../Theme';

export default {
  title: 'Example/DescriptiveTooltip',
  component: DescriptiveTooltip,
} as Meta;

const Template: Story<ITooltip> = args => (
  <Theme>
    <DescriptiveTooltip {...args} />
  </Theme>
);

export const Overview = Template.bind({});
Overview.args = {
  position: 'top',
  text: 'Custom text',
};
