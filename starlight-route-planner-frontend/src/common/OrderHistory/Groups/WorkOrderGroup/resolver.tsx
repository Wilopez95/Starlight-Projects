import React from 'react';

import { AvailableWorkOrderHistoryAttributes } from '@root/types';

import { HistoryChanges, HistoryEventType } from '../../components/HistoryGroup/types';

import { AttributeByBusinessType } from './AttributeByBusinessType/AttributeByBusinessType';
import { BestTimeToCome } from './BestTimeToCome/BestTimeToCome';
import { Comment } from './Comment/Comment';
import { CommonAttribute } from './CommonAttribute/CommonAttribute';
import { DailyRoute } from './DailyRoute/DailyRoute';
import { DateOn } from './DateOn/DateOn';
import { Equipment } from './Equipment/Equipment';
import { Media } from './Media/Media';
import { Status } from './Status/Status';
import { Weight } from './Weight/Weight';

export const resolveEditedChanges = <T extends keyof typeof AvailableWorkOrderHistoryAttributes>(
  change: HistoryChanges<T>,
  eventType: HistoryEventType,
): React.ReactNode => {
  const props = {
    attribute: change.attribute,
    actualChanges: change.actualChanges,
  };

  switch (change.attribute) {
    // Phone and Job Site Contact will be implemented later
    case AvailableWorkOrderHistoryAttributes.status:
      return <Status {...props} />;
    case AvailableWorkOrderHistoryAttributes.bestTimeToCome:
      return <BestTimeToCome {...props} />;
    case AvailableWorkOrderHistoryAttributes.fileName:
      return <Media {...props} eventType={eventType} />;
    case AvailableWorkOrderHistoryAttributes.assignedRoute:
      return <DailyRoute {...props} />;
    case AvailableWorkOrderHistoryAttributes.serviceDate:
    case AvailableWorkOrderHistoryAttributes.completedAt:
      return <DateOn {...props} />;
    case AvailableWorkOrderHistoryAttributes.droppedEquipment:
    case AvailableWorkOrderHistoryAttributes.pickedUpEquipment:
      return <Equipment {...props} />;
    case AvailableWorkOrderHistoryAttributes.weight:
      return <Weight {...props} />;
    case AvailableWorkOrderHistoryAttributes.instructionsForDriver:
    case AvailableWorkOrderHistoryAttributes.truckName:
    case AvailableWorkOrderHistoryAttributes.driverName:
    case AvailableWorkOrderHistoryAttributes.thirdPartyHaulerDescription:
      return <CommonAttribute {...props} />;

    case AvailableWorkOrderHistoryAttributes.toRoll:
    case AvailableWorkOrderHistoryAttributes.permitRequired:
    case AvailableWorkOrderHistoryAttributes.poRequired:
    case AvailableWorkOrderHistoryAttributes.signatureRequired:
    case AvailableWorkOrderHistoryAttributes.highPriority:
    case AvailableWorkOrderHistoryAttributes.someoneOnSite:
    case AvailableWorkOrderHistoryAttributes.alleyPlacement:
      return <AttributeByBusinessType {...props} />;

    case AvailableWorkOrderHistoryAttributes.comment:
      return <Comment {...props} />;
    default:
      return null;
  }
};
