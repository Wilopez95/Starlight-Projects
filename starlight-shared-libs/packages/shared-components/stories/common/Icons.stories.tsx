import React from 'react';
import { Meta } from '@storybook/react/types-6-0';

import * as Icons from '../../src/assets';

import './Icons.stories.scss';

export default {
  title: 'Example/Icons',
} as Meta;

export const Preview: React.FC = () => (
  <div style={{ width: '600px' }}>
    <table>
      <th>Name</th>
      <th>Example</th>
      {Object.entries(Icons).map(([key, Component], index) => (
        <tr key={index}>
          <td>{key}</td>
          <td>
            <Component />
          </td>
        </tr>
      ))}
    </table>
  </div>
);
