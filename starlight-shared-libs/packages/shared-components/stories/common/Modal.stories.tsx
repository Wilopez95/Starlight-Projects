import React, { useState } from 'react';
import { Meta, Story } from '@storybook/react/types-6-0';

import { Button, IModal, Modal } from '../../src/common';
import { Theme } from '../Theme';

export default {
  title: 'Example/Modal',
  component: Modal,
} as Meta;

export const Overview: Story<IModal> = args => {
  const [isOpen, toggle] = useState(false);

  return (
    <Theme>
      <Modal {...args} isOpen={isOpen} onClose={() => toggle(!isOpen)}>
        <div>Modal content</div>
      </Modal>
      <Button onClick={() => toggle(!isOpen)}>Open</Button>
    </Theme>
  );
};
