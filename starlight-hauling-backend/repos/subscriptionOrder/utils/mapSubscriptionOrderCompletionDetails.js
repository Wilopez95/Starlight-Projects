import { mathRound2 } from '../../../utils/math.js';

export const mapSubscriptionOrderCompletionDetails = workOrders => {
  const {
    workOrdersCompletionDates,
    truckNumbers,
    droppedEquipmentItems,
    assignedRoutes,
    pickedUpEquipmentItems,
    weight,
  } = workOrders.reduce(
    (res, workOrder) => {
      workOrder.completedAt && res.workOrdersCompletionDates.push(workOrder.completedAt);

      workOrder.truckNumber && res.truckNumbers.push(workOrder.truckNumber);

      workOrder.droppedEquipmentItem &&
        res.droppedEquipmentItems.push(workOrder.droppedEquipmentItem);

      workOrder.assignedRoute && res.assignedRoutes.push(workOrder.assignedRoute);

      workOrder.pickedUpEquipmentItem &&
        res.pickedUpEquipmentItems.push(workOrder.pickedUpEquipmentItem);

      if (workOrder.weight) {
        res.weight += mathRound2(workOrder.weight);
      }
      return res;
    },
    {
      workOrdersCompletionDates: [],
      truckNumbers: [],
      droppedEquipmentItems: [],
      assignedRoutes: [],
      pickedUpEquipmentItems: [],
      mediaFiles: [],
      weight: 0,
    },
  );

  return {
    completedAt: workOrdersCompletionDates?.length
      ? new Date(Math.max(workOrdersCompletionDates))
      : null,
    truckNumbers,
    droppedEquipmentItems,
    assignedRoutes,
    pickedUpEquipmentItems,
    weight,
  };
};
