import React from 'react';

import { IOrderHistoryChange } from '@root/types';

import { IBaseOrderHistoryChange } from '../types';
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
      return (
        <OrderHistoryRouteChanges
          {...(props as IBaseOrderHistoryChange<string, string, undefined, undefined>)}
        />
      );
    }
    case 'truck': {
      return (
        <OrderHistoryTruckChanges
          {...(props as IBaseOrderHistoryChange<string, string, undefined, undefined>)}
        />
      );
    }
    case 'droppedEquipmentItem': {
      return (
        <OrderHistoryDroppedEquipmentItemChanges
          {...(props as IBaseOrderHistoryChange<string, string, undefined, undefined>)}
        />
      );
    }
    case 'pickedUpEquipmentItem': {
      return (
        <OrderHistoryPickedUpEquipmentItemChanges
          {...(props as IBaseOrderHistoryChange<string, string, undefined, undefined>)}
        />
      );
    }
    case 'arriveOnSiteDate': {
      return (
        <OrderHistoryArriveOnSiteChanges
          {...(props as IBaseOrderHistoryChange<string, string, undefined, undefined>)}
        />
      );
    }
    case 'completionDate': {
      return (
        <OrderHistoryCompletionDateChanges
          {...(props as IBaseOrderHistoryChange<string, string, undefined, undefined>)}
        />
      );
    }
    case 'startWorkOrderDate': {
      return (
        <OrderHistoryStartWorkOrderDateChanges {...(props as IBaseOrderHistoryChange<string>)} />
      );
    }
    case 'startServiceDate': {
      return (
        <OrderHistoryStartServiceDateChanges {...(props as IBaseOrderHistoryChange<string>)} />
      );
    }
    case 'finishServiceDate': {
      return (
        <OrderHistoryFinishServiceDateChanges {...(props as IBaseOrderHistoryChange<string>)} />
      );
    }
    case 'weight': {
      return <OrderHistoryWeightChanges {...(props as IBaseOrderHistoryChange<string>)} />;
    }
    case 'ticket': {
      return <OrderHistoryTicketChanges {...(props as IBaseOrderHistoryChange<string | null>)} />;
    }
    default:
      return null;
  }
};
