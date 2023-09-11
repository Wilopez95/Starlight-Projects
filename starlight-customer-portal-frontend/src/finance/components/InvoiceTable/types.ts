import { IInvoiceTableHeader } from '@root/finance/components/InvoiceTable/InvoiceTableHeader/types';
import { Invoice } from '@root/finance/stores/invoice/Invoice';

export interface IInvoiceTable extends IInvoiceTableHeader {
  tableBodyContainer?: React.RefObject<HTMLTableSectionElement>;
  onSelect?(invoice: Invoice): void;
}
