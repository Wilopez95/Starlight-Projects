import React from 'react';
import { Meta, Story } from '@storybook/react/types-6-0';

import { IValidationBlock, ValidationMessageBlock } from '../../src/common';
import { Theme } from '../Theme';

export default {
  title: 'Example/ValidationMessageBlock',
  component: ValidationMessageBlock,
} as Meta;

const Template: Story<IValidationBlock> = args => (
  <Theme>
    <ValidationMessageBlock {...args} />
  </Theme>
);

export const Overview = Template.bind({});
Overview.args = {
  children: 'Validation Text',
  color: 'default',
  shade: 'light',
  textColor: 'default',
};
