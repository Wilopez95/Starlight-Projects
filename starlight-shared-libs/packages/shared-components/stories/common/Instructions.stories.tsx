import React from 'react';
import { Meta, Story } from '@storybook/react/types-6-0';

import { IInstructions, Instructions } from '../../src/common';
import { Theme } from '../Theme';

export default {
  title: 'Example/Instructions',
  component: Instructions,
} as Meta;

const Template: Story<IInstructions> = args => (
  <Theme>
    <Instructions {...args} />
  </Theme>
);

export const Overview = Template.bind({});
Overview.args = {
  headerText: 'Header Text',
};
