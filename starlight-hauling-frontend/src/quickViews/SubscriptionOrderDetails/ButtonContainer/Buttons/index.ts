import { SubscriptionOrderStatusEnum } from '@root/types';

import ApprovedComponent from './Approved';
import CompletedComponent from './Completed';
import InProgressComponent from './InProgress';

export const getButtons = (status?: SubscriptionOrderStatusEnum) => {
  switch (status) {
    case SubscriptionOrderStatusEnum.inProgress:
      return InProgressComponent;
    case SubscriptionOrderStatusEnum.needsApproval:
      return CompletedComponent;
    case SubscriptionOrderStatusEnum.completed:
      return CompletedComponent;
    case SubscriptionOrderStatusEnum.approved:
      return ApprovedComponent;
    default:
      return null;
  }
};
