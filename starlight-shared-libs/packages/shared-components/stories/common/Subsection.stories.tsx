import React from 'react';
import { Meta, Story } from '@storybook/react/types-6-0';

import { ISubsection, Subsection } from '../../src/common';
import { Theme } from '../Theme';

export default {
  title: 'Example/Subsection',
  component: Subsection,
} as Meta;

const Template: Story<ISubsection> = args => (
  <Theme>
    <Subsection {...args} />
  </Theme>
);

export const Overview = Template.bind({});
Overview.args = {
  children: 'Custom text',
  hint: 'Hint text',
};
