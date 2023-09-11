import { Invoice } from '@root/finance/stores/invoice/Invoice';

export interface IInvoicePreview {
  invoice: Invoice;
  showSendEmail?: boolean;
}
