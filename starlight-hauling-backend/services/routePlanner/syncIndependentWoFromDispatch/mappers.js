import fpPick from 'lodash/fp/pick.js';
import isEmpty from 'lodash/isEmpty.js';

import { INDEPENDENT_WO_FIELDS_SYNC_FROM_ROUTE_PLANNER } from '../../../consts/workOrder.js';

const extractWoFields = fpPick(INDEPENDENT_WO_FIELDS_SYNC_FROM_ROUTE_PLANNER);

export const mapIndependentWorkOrders = independentOrders =>
  independentOrders.reduce(
    (res, itemRaw) => {
      const item = extractWoFields(itemRaw);
      item.route = itemRaw.assignedRoute;
      item.driverInstructions = itemRaw.instructionsForDriver;
      item.completionDate = itemRaw.completedAt;
      item.status = item.status === 'IN_PROGRESS' ? 'INPROGRESS' : item.status;
      item.pickedUpEquipmentItem = itemRaw.pickedUpEquipment || null;
      item.droppedEquipmentItem = itemRaw.droppedEquipment || null;
      item.weight = itemRaw.weight || null;
      item.truck = itemRaw.truckNumber;

      if (!isEmpty(item.lineItems)) {
        res.independentWosLineItems.push({
          lineItem: itemRaw.lineItems.filter(Boolean).map(lineItem => ({
            ...lineItem,
          })),
          orderId: itemRaw.orderId,
        });

        item.independentWosLineItemsIds.push(
          ...itemRaw.lineItems.filter(Boolean).map(lineItem => lineItem.billableLineItemId),
        );
      }

      res.updatedIndependentWos.push(item);
      return res;
    },
    {
      independentWosLineItems: [],
      independentWosLineItemsIds: [],
      updatedIndependentWos: [],
    },
  );
