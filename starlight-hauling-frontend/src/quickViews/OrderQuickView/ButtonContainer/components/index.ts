import { OrderAllStatusTypes } from '@root/types';

import ApprovedButtonContainer from './Approved';
import CanceledButtonContainer from './Canceled';
import CompletedButtonContainer from './Completed';
import FinalizedButtonContainer from './Finalized';
import InProgressButtonContainer from './InProgress';
import InvoicedButtonContainer from './Invoiced';

export const getCurrentContainer = (status: OrderAllStatusTypes) => {
  switch (status) {
    case 'inProgress':
      return InProgressButtonContainer;
    case 'completed':
      return CompletedButtonContainer;
    case 'approved':
      return ApprovedButtonContainer;
    case 'finalized':
      return FinalizedButtonContainer;
    case 'invoiced':
      return InvoicedButtonContainer;
    case 'canceled':
      return CanceledButtonContainer;
    default:
      return null;
  }
};
