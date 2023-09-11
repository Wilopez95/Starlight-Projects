import React from 'react';
import { Meta, Story } from '@storybook/react/types-6-0';

import { Carousel, ICarousel } from '../../src/common';
import { Theme } from '../Theme';

export default {
  title: 'Example/Carousel',
  component: Carousel,
} as Meta;

const Template: Story<ICarousel> = args => (
  <Theme>
    <Carousel {...args} />
  </Theme>
);

export const Overview = Template.bind({});
Overview.args = {
  children: 'Carousel',
};
