import React from 'react';
import { Meta, Story } from '@storybook/react/types-6-0';

import { Banner, IBanner } from '../../src/common';
import { Theme } from '../Theme';

export default {
  title: 'Example/Banner',
  component: Banner,
} as Meta;

const Template: Story<IBanner> = args => (
  <Theme>
    <Banner {...args}>Test Text</Banner>
  </Theme>
);

export const Overview = Template.bind({});
Overview.args = {
  showIcon: true,
  removable: true,
};
