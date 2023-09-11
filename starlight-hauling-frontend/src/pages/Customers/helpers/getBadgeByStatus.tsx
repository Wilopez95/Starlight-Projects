import React from 'react';
import { startCase } from 'lodash';

import { Badge } from '@root/common';
import { CustomerStatus } from '@root/consts';

export const getBadgeByStatus = (status: CustomerStatus) => {
  switch (status) {
    case 'active':
      return <Badge color="success">{startCase(status)}</Badge>;
    case 'onHold':
      return <Badge color="alert">{startCase(status)}</Badge>;
    default:
      return <Badge color="alert">{startCase(status)}</Badge>;
  }
};
