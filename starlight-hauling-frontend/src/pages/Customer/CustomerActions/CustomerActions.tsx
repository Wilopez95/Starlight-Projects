import React from 'react';
import { Layouts } from '@starlightpro/shared-components';

import { Divider } from '@root/common/TableTools';

import { ICustomerActions } from './types';

export const CustomerActions: React.FC<ICustomerActions> = ({ children }) => (
  <Layouts.Box position="sticky" bottom="0" backgroundColor="white">
    <Divider />
    <Layouts.Padding top="2" right="3" bottom="2" left="3">
      {children}
    </Layouts.Padding>
  </Layouts.Box>
);
