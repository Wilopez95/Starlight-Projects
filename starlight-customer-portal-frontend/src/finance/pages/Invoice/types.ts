import { InvoiceType } from '@root/finance/types/entities';

export interface IInvoicePage {
  type: InvoiceType;
  customerId: number;
  tabContainer: React.MutableRefObject<HTMLDivElement | null>;
}
