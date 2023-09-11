import { Payment } from '@root/modules/billing/entities';

import { IDeferredPaymentsTableHeader } from './DeferredPaymentsHeader/types';

export interface IDeferredPaymentsTable extends IDeferredPaymentsTableHeader {
  tableBodyContainer: React.RefObject<HTMLTableSectionElement>;
  onSelect(payment: Payment): void;
}
