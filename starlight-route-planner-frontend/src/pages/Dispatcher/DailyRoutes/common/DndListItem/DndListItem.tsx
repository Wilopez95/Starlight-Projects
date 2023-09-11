import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';

import { StatusBadge } from '@root/common';
import { IWorkOrderMapItem } from '@root/stores/workOrderMapItem/types';
import { IWorkOrder } from '@root/types';

import { AddressText, TimeToCome, WorkOrderIdText } from './styles';

interface IDndListItem {
  workOrder: IWorkOrder | IWorkOrderMapItem;
  showStatusLabel?: boolean;
  redirectById?: (id: number | string) => void;
}

const I18N_PATH_ROUTE_DETAILS = 'quickViews.DailyRouteDetails.Text.';

export const DndListItem: React.FC<IDndListItem> = ({
  workOrder,
  showStatusLabel,
  redirectById,
}) => {
  const { t } = useTranslation();

  return (
    <Layouts.Flex flexGrow={1} direction="column">
      <Layouts.Margin bottom="1">
        <Layouts.Flex>
          {t(`${I18N_PATH_ROUTE_DETAILS}WorkOrderNumber`)}{' '}
          <WorkOrderIdText onClick={() => redirectById?.(workOrder.id)}>
            {workOrder.displayId}
          </WorkOrderIdText>
          {showStatusLabel && (
            <Layouts.Margin left="1">
              <StatusBadge status={workOrder.status} routeType="daily-routes" />
            </Layouts.Margin>
          )}
        </Layouts.Flex>
      </Layouts.Margin>
      <Layouts.Flex justifyContent="space-between" alignItems="flex-end" flexGrow={1}>
        <Layouts.Flex flexGrow={1}>
          <AddressText>
            {workOrder.jobSite.address.addressLine1}
            <br />
            {workOrder.jobSite.address.addressLine2}
          </AddressText>
        </Layouts.Flex>
        <Layouts.Margin left="auto">
          <Layouts.Flex justifyContent="flex-end">
            <TimeToCome>
              {workOrder.bestTimeToComeFrom}–{workOrder.bestTimeToComeTo}
            </TimeToCome>
          </Layouts.Flex>
        </Layouts.Margin>
      </Layouts.Flex>
    </Layouts.Flex>
  );
};
