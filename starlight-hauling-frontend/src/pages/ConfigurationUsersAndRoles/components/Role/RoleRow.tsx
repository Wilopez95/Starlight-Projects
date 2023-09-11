import React from 'react';

import { Typography } from '@root/common';
import { TableCell, TableRow } from '@root/common/TableTools';
import { StatusBadge } from '@root/components';
import { Role } from '@root/stores/entities';
import { IBaseRow } from '@root/types';

export const RoleRow: React.FC<IBaseRow<Role>> = ({ onSelect, item, selectedItem }) => (
  <TableRow
    onClick={() => {
      onSelect(item);
    }}
    selected={selectedItem?.id === item.id}
  >
    <TableCell>
      <StatusBadge active={item.active} />
    </TableCell>
    <TableCell maxWidth={400}>
      <Typography ellipsis>{item.description}</Typography>
    </TableCell>
    <TableCell maxWidth={400}>
      <Typography ellipsis>{item.usersCount}</Typography>
    </TableCell>
  </TableRow>
);
