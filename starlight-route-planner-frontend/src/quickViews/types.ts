import QuickViewStyles from './css/styles.scss';

export interface IQuickView {
  condition: boolean;
  parentRef: React.MutableRefObject<HTMLElement | null>;
  clickOutSelectors?: string[];
  closeOnClickOut?: boolean;
  isAnimated?: boolean;
  showTableHeader?: boolean;
  clickOutContainers?:
    | React.MutableRefObject<HTMLElement | null>[]
    | React.MutableRefObject<HTMLElement | null>;
  saveChanges?(): void;
  clickOutHandler?(): void;
  onCancel?(showModal?: boolean): void;
  children(data: QuickViewChildrenFunction): React.ReactNode;
  loading?: boolean;
  error?: boolean;
  // TODO not used now
  quickViewClassName?: string;
  confirmModal?: boolean;
  confirmModalText?: string;
  id?: string;
}

type QuickViewChildrenFunction = {
  scrollContainerHeight: number;
  quickViewStyles: typeof QuickViewStyles;
  onAddRef(ref: HTMLElement | null): void;
};

export type QuickViewSize = 'full' | 'three-quarters' | 'half' | 'moderate' | 'default';

export interface IQuickViewLeftPanel {
  showCustomer?: boolean;
}
