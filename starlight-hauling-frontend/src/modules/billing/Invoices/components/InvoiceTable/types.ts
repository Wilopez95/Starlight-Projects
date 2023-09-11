import { Invoice } from '../../../Invoices/store/Invoice';

import { IInvoiceTableHeader } from './InvoiceTableHeader/types';

export interface IInvoiceTable extends IInvoiceTableHeader {
  tableBodyContainer?: React.RefObject<HTMLTableSectionElement>;
  onSelect?(invoice: Invoice): void;
}
