import React from 'react';
import { Meta, Story } from '@storybook/react/types-6-0';

import { ArrowLeftIcon } from '../../src/assets';
import { Dropdown, OptionGroup, OptionItem } from '../../src/common';
import { IBaseComponent } from '../../src/types/base';
import { Theme } from '../Theme';

export default {
  title: 'Example/Dropdown',
  component: Dropdown,
} as Meta;

export const Overview: Story<IBaseComponent> = args => (
  <Theme>
    <Dropdown {...args}>
      <OptionGroup title="Header" image={ArrowLeftIcon}>
        <OptionItem>Item 1</OptionItem>
        <OptionItem>Item 2</OptionItem>
      </OptionGroup>
    </Dropdown>
  </Theme>
);
