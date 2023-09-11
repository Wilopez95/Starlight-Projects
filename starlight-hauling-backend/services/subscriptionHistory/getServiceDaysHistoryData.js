import { SUBSCTIPTION_HISTORY_ACTION } from '../../consts/subscriptionHistoryActions.js';
import { SUBSCTIPTION_HISTORY_ENTITY } from '../../consts/subscriptionHistoryEntities.js';
import { SERVICE_ITEM_ATTRIBUTE } from '../../consts/subscriptionServiceItemHistoryAttributes.js';

export const getServiceDaysHistoryData = ({
  subscriptionId,
  serviceName,
  effectiveDate,
  user,
  oldServiceDays = {},
  newServiceDays = {},
}) => {
  const historyDataArray = [];
  const historyDataBasicObject = {
    subscriptionId,
    effectiveDate,
    entity: SUBSCTIPTION_HISTORY_ENTITY.recurrentService,
    madeBy: user.name,
    madeById: user.id,
  };

  // check each day from Monday (0) to Sunday (6)
  for (let i = 0; i < 7; i++) {
    const oldServiceDay = oldServiceDays[i];
    const newServiceDay = newServiceDays[i];
    // service day removed
    if (oldServiceDay && !newServiceDay) {
      historyDataArray.push({
        action: SUBSCTIPTION_HISTORY_ACTION.removed,
        attribute: SERVICE_ITEM_ATTRIBUTE.serviceDay,
        description: {
          previousValue: i,
          serviceName,
          masterRoute: oldServiceDay.route,
        },
        ...historyDataBasicObject,
      });
    }
    // service day added
    if (newServiceDay && !oldServiceDay) {
      historyDataArray.push({
        action: SUBSCTIPTION_HISTORY_ACTION.added,
        attribute: SERVICE_ITEM_ATTRIBUTE.serviceDay,
        description: {
          newValue: i,
          serviceName,
          masterRoute: newServiceDay.route,
        },
        ...historyDataBasicObject,
      });
    }
    if (oldServiceDay && newServiceDay) {
      // check master route updates
      if (oldServiceDay.route !== newServiceDay.route) {
        const newValue = newServiceDay.route;
        const previousValue = oldServiceDay.route;
        let action = SUBSCTIPTION_HISTORY_ACTION.changed;

        if (newValue === null || newValue === undefined) {
          action = SUBSCTIPTION_HISTORY_ACTION.removed;
        }
        if (previousValue === null || previousValue === undefined) {
          action = SUBSCTIPTION_HISTORY_ACTION.added;
        }

        historyDataArray.push({
          action,
          attribute: SERVICE_ITEM_ATTRIBUTE.masterRoute,
          description: {
            newValue,
            previousValue,
            serviceDay: i,
            serviceName,
          },
          ...historyDataBasicObject,
        });
      }
      // check required by customer updatess
      if (oldServiceDay.requiredByCustomer !== newServiceDay.requiredByCustomer) {
        const newValue = newServiceDay.requiredByCustomer;
        const previousValue = oldServiceDay.requiredByCustomer;
        let action = SUBSCTIPTION_HISTORY_ACTION.changed;

        if (newValue === null || newValue === undefined) {
          action = SUBSCTIPTION_HISTORY_ACTION.removed;
        }
        if (previousValue === null || previousValue === undefined) {
          action = SUBSCTIPTION_HISTORY_ACTION.added;
        }

        historyDataArray.push({
          action,
          attribute: SERVICE_ITEM_ATTRIBUTE.requiredByCustomer,
          description: {
            newValue,
            previousValue,
            serviceDay: i,
            serviceName,
          },
          ...historyDataBasicObject,
        });
      }
    }
  }

  return historyDataArray;
};
