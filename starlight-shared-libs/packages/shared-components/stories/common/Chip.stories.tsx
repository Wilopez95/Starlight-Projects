import React from 'react';
import { Meta, Story } from '@storybook/react/types-6-0';

import { CirclePlusIcon } from '../../src/assets';
import { Chip, IChip } from '../../src/common';
import { Theme } from '../Theme';

export default {
  title: 'Example/Chip',
  component: Chip,
} as Meta;

const Template: Story<IChip> = args => (
  <Theme>
    <Chip {...args} />
  </Theme>
);

export const Overview = Template.bind({});
Overview.args = {
  onIconClick: () => null,
  icon: CirclePlusIcon,
  children: 'Text in chip',
};
