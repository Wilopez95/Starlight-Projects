import React, { useCallback } from 'react';
import { useHistory } from 'react-router';

import { DndListItemWrapper as ListItemWrapper } from '@root/common/DndListItemWrapper';
import { Paths } from '@root/consts';
import { pathToUrl } from '@root/helpers';
import { useBusinessContext } from '@root/hooks';
import { DndListItem as ListItem } from '@root/pages/Dispatcher/DailyRoutes/common';
import { IDashboardDailyRoute } from '@root/types';

interface IProps {
  dailyRoute: IDashboardDailyRoute;
}

export const WorkOrdersTab: React.FC<IProps> = ({ dailyRoute }) => {
  const { workOrders } = dailyRoute;

  const { businessUnitId } = useBusinessContext();
  const history = useHistory();
  const redirectToWODetailsById = useCallback(
    (id: number | string) => {
      const route = pathToUrl(Paths.DispatchModule.WorkOrder, {
        businessUnit: businessUnitId,
        id,
      });

      history.push(route);
    },
    [businessUnitId, history],
  );

  return (
    <>
      {workOrders.map((workOrder, index) => {
        return (
          <ListItemWrapper key={workOrder.id} id={workOrder.id} sequence={index + 1} readOnly>
            <ListItem
              workOrder={workOrder}
              redirectById={() => redirectToWODetailsById(workOrder.displayId)}
              showStatusLabel
            />
          </ListItemWrapper>
        );
      })}
    </>
  );
};
