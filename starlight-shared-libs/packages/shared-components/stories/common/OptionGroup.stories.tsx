import React from 'react';
import { Meta, Story } from '@storybook/react/types-6-0';

import { BrokersIcon } from '../../src/assets';
import { IOptionGroup, OptionGroup, OptionItem } from '../../src/common';
import { Theme } from '../Theme';

export default {
  title: 'Example/Dropdown/OptionGroup',
  component: OptionGroup,
} as Meta;

const TemplateOptionGroup: Story<IOptionGroup> = args => (
  <Theme>
    <OptionGroup {...args}>
      <OptionItem>Item</OptionItem>
    </OptionGroup>
  </Theme>
);

export const Overview = TemplateOptionGroup.bind({
  title: 'Header',
  image: BrokersIcon,
});
