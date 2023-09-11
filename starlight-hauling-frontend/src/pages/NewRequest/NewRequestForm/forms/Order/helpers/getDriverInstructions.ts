import { Customer } from '@root/stores/entities';
import { ICustomerJobSitePair } from '@root/types';

export const getDriverInstructionsTemplate = (
  selectedCustomer?: Pick<Partial<Customer>, 'workOrderNote'> | null,
  jobSitePair?: Pick<ICustomerJobSitePair, 'workOrderNotes'> | undefined,
): string => {
  let instructions = '';
  if (selectedCustomer?.workOrderNote && selectedCustomer?.workOrderNote !== '') {
    instructions = `[${selectedCustomer.workOrderNote}]`;
  }

  if (jobSitePair?.workOrderNotes && jobSitePair?.workOrderNotes !== '') {
    instructions = `${instructions} [${jobSitePair.workOrderNotes}]`;
  }

  return instructions;
};
