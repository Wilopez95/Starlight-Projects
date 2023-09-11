export type AttachMedia = 'ATTACH_TICKET' | 'ATTACH_ALL_MEDIA';

export interface ISendInvoicesData {
  invoiceIds: number[];
  sendToCustomerInvoiceEmails: boolean;
  attachMediaEnabled: boolean;
  customerEmails: string[];
  attachMedia?: AttachMedia;
}
