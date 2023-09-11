import React from 'react';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';

import { Badge, Typography } from '@root/common';
import { TableCell, TableRow } from '@root/common/TableTools';
import { StatusBadge } from '@root/components';
import { useStores } from '@root/hooks';
import { User } from '@root/stores/entities';
import { IBaseRow } from '@root/types';

export const UserRow: React.FC<IBaseRow<User>> = observer(
  ({ onSelect, item: user, selectedItem }) => {
    const { t } = useTranslation();
    const { businessUnitStore } = useStores();

    return (
      <TableRow
        onClick={() => {
          onSelect(user);
        }}
        selected={selectedItem?.id === user.id}
      >
        <TableCell>
          <StatusBadge active={user.active} />
        </TableCell>
        <TableCell maxWidth={400}>
          <Typography ellipsis>{user.fullName}</Typography>
        </TableCell>
        <TableCell maxWidth={400}>
          <Typography ellipsis>{user.email}</Typography>
        </TableCell>
        <TableCell maxWidth={400}>
          <Typography ellipsis>{user.roles?.map(role => role.description).join(', ')}</Typography>
        </TableCell>
        <TableCell maxWidth={400}>
          <Typography ellipsis>
            {user.salesRepresentatives
              .map(data => businessUnitStore.getById(data.businessUnitId)?.fullName)
              .join(', ')}
          </Typography>
        </TableCell>
        <TableCell fallback="">
          {user.hasPersonalPermissions ? (
            <Badge color="information">
              {t(
                'pages.SystemConfiguration.tables.UsersAndRoles.components.User.Text.PersonalPermissions',
              )}
            </Badge>
          ) : null}
        </TableCell>
      </TableRow>
    );
  },
);
