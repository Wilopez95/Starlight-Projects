import React from 'react';
import { Meta, Story } from '@storybook/react/types-6-0';

import { CirclePlusIcon } from '../../src/assets';
import { Button, IButton } from '../../src/common';
import { Theme } from '../Theme';

export default {
  title: 'Example/Button',
  component: Button,
} as Meta;

const Template: Story<IButton> = args => (
  <Theme>
    <Button {...args} />
  </Theme>
);

export const Overview = Template.bind({});
Overview.args = {
  children: 'Text',
  iconLeft: CirclePlusIcon,
};
