import React from 'react';

import { IOrderHistoryChange } from '../../types';

import { OrderHistoryArriveOnSiteChanges } from './ArriveOnSite/ArriveOnSite';
import { OrderHistoryCompletionDateChanges } from './CompletionDate/CompletionDate';
import { OrderHistoryDroppedEquipmentItemChanges } from './DroppedEquipmentItem/DroppedEquipmentItem';
import { OrderHistoryFinishServiceDateChanges } from './FinishServiceDate/FinishServiceDate';
import { OrderHistoryPickedUpEquipmentItemChanges } from './PickedUpEquipmentItem/PickedUpEquipmentItem';
import { OrderHistoryRouteChanges } from './Route/Route';
import { OrderHistoryStartServiceDateChanges } from './StartServiceDate/StartServiceDate';
import { OrderHistoryStartWorkOrderDateChanges } from './StartWorkOrderDate/StartWorkOrderDate';
import { OrderHistoryTicketChanges } from './Ticket/Ticket';
import { OrderHistoryTruckChanges } from './Truck/Truck';
import { OrderHistoryWeightChanges } from './Weight/Weight';

export const resolveEditedChanges = (change: IOrderHistoryChange): React.ReactNode => {
  const props = {
    newValue: change.newValue,
    prevValue: change.previousValue,
    populated: {
      newValue: change.populatedValues?.newValue,
      prevValue: change.populatedValues?.previousValue,
    },
  };

  switch (change.attribute) {
    case 'route': {
      return <OrderHistoryRouteChanges {...props} />;
    }
    case 'truck': {
      return <OrderHistoryTruckChanges {...props} />;
    }
    case 'droppedEquipmentItem': {
      return <OrderHistoryDroppedEquipmentItemChanges {...props} />;
    }
    case 'pickedUpEquipmentItem': {
      return <OrderHistoryPickedUpEquipmentItemChanges {...props} />;
    }
    case 'arriveOnSiteDate': {
      return <OrderHistoryArriveOnSiteChanges {...props} />;
    }
    case 'completionDate': {
      return <OrderHistoryCompletionDateChanges {...props} />;
    }
    case 'startWorkOrderDate': {
      return <OrderHistoryStartWorkOrderDateChanges {...props} />;
    }
    case 'startServiceDate': {
      return <OrderHistoryStartServiceDateChanges {...props} />;
    }
    case 'finishServiceDate': {
      return <OrderHistoryFinishServiceDateChanges {...props} />;
    }
    case 'weight': {
      return <OrderHistoryWeightChanges {...props} />;
    }
    case 'ticket': {
      return <OrderHistoryTicketChanges {...props} />;
    }
  }

  return null;
};
