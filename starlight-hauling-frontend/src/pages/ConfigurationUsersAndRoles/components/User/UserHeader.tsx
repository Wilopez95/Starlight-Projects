import React from 'react';
import { useTranslation } from 'react-i18next';

import { TableCell, TableTools } from '@root/common/TableTools';

const I18N_PATH = 'pages.SystemConfiguration.tables.UsersAndRoles.components.User.Text.';

export const UserHeader: React.FC = () => {
  const { t } = useTranslation();

  return (
    <TableTools.Header>
      <TableTools.HeaderCell minWidth={50 + 48}>{t(`Text.Status`)}</TableTools.HeaderCell>
      <TableTools.HeaderCell minWidth={120 + 48}>{t(`Text.Name`)}</TableTools.HeaderCell>
      <TableTools.HeaderCell minWidth={180 + 48}>{t(`Text.Email`)}</TableTools.HeaderCell>
      <TableTools.HeaderCell minWidth={120 + 48}>
        {t(`${I18N_PATH}AssignedRoles`)}
      </TableTools.HeaderCell>
      <TableTools.HeaderCell minWidth={220 + 48}>{t(`${I18N_PATH}SalesRep`)}</TableTools.HeaderCell>
      <TableCell full center fallback="" emptyTh />
    </TableTools.Header>
  );
};
