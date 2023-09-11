import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@starlightpro/shared-components';

import { getStatusBadgeProps } from './getBadgeProps';
import { IStatusBadge } from './types';

const I18N_ROOT_PATH = 'Text.';

export const StatusBadge: React.FC<IStatusBadge> = ({ status, routeType }) => {
  const { t } = useTranslation();

  const statusBadgeProps = useMemo(() => {
    return getStatusBadgeProps(status, routeType);
  }, [status, routeType]);

  return <Badge {...statusBadgeProps}>{t(`${I18N_ROOT_PATH}${status}`)}</Badge>;
};
