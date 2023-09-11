import { FinanceCharge } from '../../store/FinanceCharge';

export interface IFinanceChargeTable {
  showCustomer?: boolean;
  tableBodyContainer?: React.RefObject<HTMLTableSectionElement>;
  onSelect?(financeCharge: FinanceCharge): void;
  onRequest(): void;
}
