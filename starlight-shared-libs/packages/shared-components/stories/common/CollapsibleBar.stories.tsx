import React from 'react';
import { Meta, Story } from '@storybook/react/types-6-0';

import { CirclePlusIcon } from '../../src/assets';
import { CollapsibleBar, ICollapsibleBar } from '../../src/common';
import { Theme } from '../Theme';

export default {
  title: 'Example/CollapsibleBar',
  component: CollapsibleBar,
} as Meta;

const Template: Story<ICollapsibleBar> = args => (
  <Theme>
    <CollapsibleBar {...args}>Content Text is Here</CollapsibleBar>
  </Theme>
);

export const Overview = Template.bind({});
Overview.args = {
  beforeIcon: CirclePlusIcon,
  label: 'test label',
  open: true,
};
