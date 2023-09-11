import { SubscriptionOrderStatusEnum } from '@root/types';

import ApprovedComponent from './Approved';
import CancelOrderComponent from './CancelOrder';
import CompletedComponent from './Completed';
import FinalizedComponent from './Finalized';
import InProgressComponent from './InProgress';
import InvoicedComponent from './Invoiced';

export const getButtons = (status: SubscriptionOrderStatusEnum) => {
  switch (status) {
    case SubscriptionOrderStatusEnum.scheduled:
      return CancelOrderComponent;
    case SubscriptionOrderStatusEnum.inProgress:
      return InProgressComponent;
    case SubscriptionOrderStatusEnum.completed:
      return CompletedComponent;
    case SubscriptionOrderStatusEnum.needsApproval:
      return CompletedComponent;
    case SubscriptionOrderStatusEnum.approved:
      return ApprovedComponent;
    case SubscriptionOrderStatusEnum.finalized:
      return FinalizedComponent;
    case SubscriptionOrderStatusEnum.invoiced:
      return InvoicedComponent;

    default:
      return null;
  }
};
