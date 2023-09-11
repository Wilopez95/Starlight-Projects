import React from 'react';
import { useTranslation } from 'react-i18next';

import { TableTools } from '@root/common/TableTools';

export const RoleHeader: React.FC = () => {
  const { t } = useTranslation();

  return (
    <TableTools.Header>
      <TableTools.HeaderCell minWidth={50 + 48}>{t('Text.Status')}</TableTools.HeaderCell>
      <TableTools.HeaderCell>{t('Text.Description')}</TableTools.HeaderCell>
      <TableTools.HeaderCell>{t('Text.Users')}</TableTools.HeaderCell>
    </TableTools.Header>
  );
};
