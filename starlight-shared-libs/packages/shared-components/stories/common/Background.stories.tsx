import React from 'react';
import { Meta } from '@storybook/react/types-6-0';

import { Background } from '../../src/common';

import './Background.stories.scss';

export default {
  title: 'Example/Background',
} as Meta;

export const Preview: React.FC = () => (
  <div style={{ width: '600px' }}>
    <Background />
    <div>
      `Background` will take all space starting from Y coordinate defined by css var
      `--headerHeight`
    </div>
  </div>
);
