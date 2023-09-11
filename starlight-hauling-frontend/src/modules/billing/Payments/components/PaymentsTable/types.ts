import { ManuallyCreatablePayment } from '../../types';

export interface IPaymentsTable {
  tableRef: React.RefObject<HTMLTableElement>;
  onSelect(payment: ManuallyCreatablePayment): void;
  onSort(): void;
  showCustomer?: boolean;
}
