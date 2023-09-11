import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts, Typography } from '@starlightpro/shared-components';

import { useStores } from '@root/hooks';

import { CrossIcon } from '../styles';

const I18N_PATH = 'components.modals.WorkOrderDetails.';

interface IHeader {
  id: number;
  onClosePopup: () => void;
  jobSiteGroupedItems?: number[];
}

export const Header: React.FC<IHeader> = ({ id, onClosePopup, jobSiteGroupedItems }) => {
  const { t } = useTranslation();
  const { workOrderDailyRouteStore } = useStores();

  const { displayId = '-' } = workOrderDailyRouteStore.getById(id) ?? {};

  return (
    <Layouts.Padding top="3" left="3" right="3">
      <Typography variant="headerFour" color="default" shade="dark">
        {jobSiteGroupedItems
          ? t(`${I18N_PATH}MultiTitle`, { count: jobSiteGroupedItems.length })
          : t(`${I18N_PATH}Title`, { workOrderNumber: displayId })}
      </Typography>
      <CrossIcon onClick={onClosePopup} role="button" aria-label="close" />
    </Layouts.Padding>
  );
};
