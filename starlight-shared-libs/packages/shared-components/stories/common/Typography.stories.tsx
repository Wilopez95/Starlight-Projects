import React from 'react';
import { Meta, Story } from '@storybook/react/types-6-0';

import { ITypographyLayout, Typography } from '../../src/common';
import { Theme } from '../Theme';

export default {
  title: 'Example/Typography',
  component: Typography,
} as Meta;

const Template: Story<ITypographyLayout> = args => (
  <Theme>
    <Typography {...args}>Text example</Typography>
  </Theme>
);

export const Overview = Template.bind({});
Overview.args = {
  variant: 'bodyMedium',
  color: 'secondary',
  shade: 'desaturated',
};
