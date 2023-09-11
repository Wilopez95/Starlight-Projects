import React from 'react';
import { Meta, Story } from '@storybook/react/types-6-0';

import { ITooltip, Tooltip, Typography } from '../../src/common';
import { Theme } from '../Theme';

export default {
  title: 'Example/Tooltip',
  component: Tooltip,
} as Meta;

const Template: Story<ITooltip> = args => (
  <Theme>
    <div>
      <Tooltip {...args} />
    </div>
  </Theme>
);

export const Overview = Template.bind({});
Overview.args = {
  children: (
    <Typography
      variant="bodyMedium"
      color="secondary"
      shade="desaturated"
      textAlign="right"
      fontWeight="normal"
    >
      Custom Text
    </Typography>
  ),
  position: 'top',
  text: 'Custom text',
};
