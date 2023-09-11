import React, { useState } from 'react';
import { Meta, Story } from '@storybook/react/types-6-0';

import { ClickOutHandler, IClickOutHandler } from '../../src/common';
import { Theme } from '../Theme';

export default {
  title: 'Example/ClickOutHandler',
  component: ClickOutHandler,
} as Meta;

export const Overview: Story<IClickOutHandler> = args => {
  const [count, addCount] = useState(0);

  return (
    <Theme>
      <ClickOutHandler {...args} onClickOut={() => addCount(count + 1)}>
        <div
          style={{
            border: '1px solid black',
          }}
        >
          clicked outside of me: {count}
        </div>
      </ClickOutHandler>
    </Theme>
  );
};
