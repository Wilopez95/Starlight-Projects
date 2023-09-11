import { type BankDeposit } from '../../store/BankDeposit';

export interface IBankDepositsTable {
  tableRef: React.RefObject<HTMLTableElement>;
  onSelect(bankDeposit: BankDeposit): void;
  onSort(): void;
}
