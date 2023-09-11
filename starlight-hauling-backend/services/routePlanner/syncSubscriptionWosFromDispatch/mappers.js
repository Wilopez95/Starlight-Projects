import isEmpty from 'lodash/isEmpty.js';
import fpPick from 'lodash/fp/pick.js';
import fpOmit from 'lodash/fp/omit.js';
import {
  SUBSCRIPTION_WO_STATUS,
  SUBSCRIPTION_WO_SYNC_FROM_ROUTE_PLANNER,
} from '../../../consts/workOrder.js';

const fieldsForWos = fpPick(SUBSCRIPTION_WO_SYNC_FROM_ROUTE_PLANNER);

export const mapWorkOrders = subscriptionWorkOrders =>
  subscriptionWorkOrders.reduce(
    (res, itemRaw) => {
      const item = fieldsForWos(itemRaw);
      item.newEquipmentNumber = itemRaw.pickedUpEquipment;
      item.equipmentNumber = itemRaw.droppedEquipment;
      item.subscriptionOrderId = itemRaw.orderId;
      item.pickedUpEquipmentItem = item.pickedUpEquipment;
      item.droppedEquipmentItem = item.droppedEquipment;
      delete item.pickedUpEquipment;
      delete item.droppedEquipment;

      if (
        item.status === SUBSCRIPTION_WO_STATUS.deleted &&
        isEmpty(item.media) &&
        isEmpty(item.lineItems)
      ) {
        res.subsWosIdsToDelete.push(item.id);
      } else {
        res.updatedSubsWos.push(fpOmit(['media', 'lineItems'])(item));
        if (!isEmpty(item.media)) {
          res.subsWosMedia.push(
            ...item.media.filter(Boolean).map(media => ({
              ...media,
              subscriptionWorkOrderId: item.id,
            })),
          );
        }
        if (!isEmpty(item.lineItems)) {
          res.subsWosLineItems.push(
            ...item.lineItems.filter(Boolean).map(lineItem => ({
              ...lineItem,
              subscriptionWorkOrderId: item.id,
            })),
          );
          res.subsWosLineItemsIds.push(
            ...item.lineItems.filter(Boolean).map(lineItem => lineItem.billableLineItemId),
          );
        }
      }
      return res;
    },
    {
      subsWosIdsToDelete: [],
      updatedSubsWos: [],
      subsWosMedia: [],
      subsWosLineItems: [],
      subsWosLineItemsIds: [],
    },
  );
