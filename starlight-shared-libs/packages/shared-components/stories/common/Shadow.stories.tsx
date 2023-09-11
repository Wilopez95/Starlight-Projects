import React from 'react';
import { Meta, Story } from '@storybook/react/types-6-0';

import { IShadowLayout, Shadow, Typography } from '../../src/common';
import { Theme } from '../Theme';

export default {
  title: 'Example/Shadow',
  component: Shadow,
} as Meta;

const Template: Story<IShadowLayout> = args => (
  <Theme>
    <Shadow {...args}>
      <Typography
        variant="bodyMedium"
        color="secondary"
        shade="desaturated"
        textAlign="right"
        fontWeight="normal"
      >
        Custom Text
      </Typography>
    </Shadow>
  </Theme>
);

export const Overview = Template.bind({});
Overview.args = {
  variant: 'light',
};
