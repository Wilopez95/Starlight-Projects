import React from 'react';
import { Meta, Story } from '@storybook/react/types-6-0';

import { IOptionItem, OptionItem } from '../../src/common';
import { Theme } from '../Theme';

export default {
  title: 'Example/Dropdown/OptionItem',
  component: OptionItem,
} as Meta;

export const Overview: Story<IOptionItem> = args => (
  <Theme>
    <OptionItem {...args}>text</OptionItem>
  </Theme>
);
