import React from 'react';
import { startCase } from 'lodash';

import { Badge } from '@root/common';

import { type IChatStatus } from '../types';

export const getBadgeByStatus = (status: IChatStatus) => {
  switch (status) {
    case 'pending':
      return <Badge color="primary">{startCase(status)}</Badge>;
    case 'resolved':
      return <Badge color="success">{startCase(status)}</Badge>;
    default:
      return null;
  }
};
