export interface IInvoiceLayout {
  children: React.ReactNode;
  pageContainerRef?: React.RefObject<HTMLDivElement>;
}

export const INVOICE_STATUSES = {
  closed: 'closed',
  writeOff: 'writeOff',
};
