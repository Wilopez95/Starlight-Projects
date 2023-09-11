import React from 'react';

import { DndListItemWrapper } from '@root/common/DndListItemWrapper';
import { DndListItem } from '@root/pages/Dispatcher/DailyRoutes/common';

import { DailyRouteDriverTruck } from '../types';

// TODO: create reusable component with master routes
export const WorkOrdersTab: React.FC<DailyRouteDriverTruck> = ({ dailyRoute: { workOrders } }) => {
  return (
    <>
      {workOrders.map((workOrder, index) => (
        <DndListItemWrapper key={workOrder.id} id={workOrder.id} sequence={index + 1} readOnly>
          <DndListItem workOrder={workOrder} />
        </DndListItemWrapper>
      ))}
    </>
  );
};
