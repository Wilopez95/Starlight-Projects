import React from 'react';
import { Meta, Story } from '@storybook/react/types-6-0';

import { ILoadable, Loadable } from '../../src/common';
import { Theme } from '../Theme';

export default {
  title: 'Example/Loadable',
  component: Loadable,
} as Meta;

const Template: Story<ILoadable> = args => (
  <Theme>
    <Loadable {...args} />
  </Theme>
);

export const Overview = Template.bind({});
Overview.args = {
  tag: 'div',
};
