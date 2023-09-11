export interface IQuickView {
  tableContainerRef: React.MutableRefObject<HTMLElement | null>;
  tableScrollContainerRef?: React.MutableRefObject<HTMLDivElement | null>;
  clickOutContainers?: React.MutableRefObject<HTMLElement | null>[];
  viewMode?: boolean;
  onReload?: () => void;
}

export interface IQuickViewLeftPanel {
  showCustomer?: boolean;
}
