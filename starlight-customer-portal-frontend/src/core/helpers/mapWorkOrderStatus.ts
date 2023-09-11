import { WorkOrderStatus } from '@root/core/consts';

//TODO : add WO Status
export const mapWorkOrderStatus = (status: WorkOrderStatus) => {
  switch (status) {
    case WorkOrderStatus.InProgress: {
      return 'In Progress';
    }
    case WorkOrderStatus.Completed: {
      return 'Completed';
    }
    default: {
      console.error('not valid status');

      return 'In Progress';
    }
  }
};
