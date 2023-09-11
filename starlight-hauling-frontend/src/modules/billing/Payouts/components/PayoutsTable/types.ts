import { Payout } from '../../store/Payout';

export interface IPayoutsTable {
  tableRef: React.RefObject<HTMLTableElement>;
  showCustomer?: boolean;
  onSelect(payment: Payout): void;
  onSort(): void;
}
