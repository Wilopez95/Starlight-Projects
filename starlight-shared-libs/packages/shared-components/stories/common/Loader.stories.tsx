import React from 'react';
import { Meta, Story } from '@storybook/react/types-6-0';

import { ILoader, Loader } from '../../src/common';
import { Theme } from '../Theme';

export default {
  title: 'Example/Loader',
  component: Loader,
} as Meta;

const Template: Story<ILoader> = args => (
  <Theme>
    <Loader {...args} />
  </Theme>
);

export const Overview = Template.bind({});
Overview.args = {
  active: true,
};
