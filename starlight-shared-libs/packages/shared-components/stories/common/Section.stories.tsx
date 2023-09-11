import React from 'react';
import { Meta, Story } from '@storybook/react/types-6-0';

import { ISection, Section, Typography } from '../../src/common';
import { Theme } from '../Theme';

export default {
  title: 'Example/Section',
  component: Section,
} as Meta;

const Template: Story<ISection> = args => (
  <Theme>
    <Section {...args}>
      <Typography
        variant="bodyMedium"
        color="secondary"
        shade="desaturated"
        textAlign="right"
        fontWeight="normal"
      >
        Custom Text
      </Typography>
    </Section>
  </Theme>
);

export const Overview = Template.bind({});
Overview.args = {
  borderless: true,
  dashed: true,
};
