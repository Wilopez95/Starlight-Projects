export interface IInvoiceTableQuickView {
  tabContainer: React.MutableRefObject<HTMLDivElement | null>;
}

export enum InvoiceQuickViewTabs {
  Orders = 'orders',
  Payments = 'payments',
  Subscriptions = 'subscriptions',
}
