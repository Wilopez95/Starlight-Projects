export interface IFinanceChargeTableQuickView {
  tbodyContainerRef: React.MutableRefObject<HTMLDivElement | null>;
  tableScrollContainerRef: React.MutableRefObject<HTMLDivElement | null>;
}

export type FinanceChargeQuickViewTabs = 'invoices' | 'payments' | 'emailLog';
