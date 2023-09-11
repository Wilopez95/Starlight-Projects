import { OrderStatusType } from '@root/types';

import ApprovedComponent from './Approved';
import CompletedComponent from './Completed';
import InProgressComponent from './InProgress';

export const getButtons = (status: OrderStatusType) => {
  switch (status) {
    case 'inProgress':
      return InProgressComponent;
    case 'completed':
      return CompletedComponent;
    case 'approved':
      return ApprovedComponent;

    default:
      return null;
  }
};
