import { QuickViewSize } from '@root/common/TableTools';

export interface IQuickView {
  tableContainerRef: React.MutableRefObject<HTMLElement | null>;
  tableScrollContainerRef?: React.MutableRefObject<HTMLDivElement | null>;
  clickOutContainers?:
    | React.MutableRefObject<HTMLElement | null>[]
    | React.MutableRefObject<HTMLElement | null>;
  viewMode?: boolean;
  size?: QuickViewSize;
}

export interface IQuickViewLeftPanel {
  showCustomer?: boolean;
}
