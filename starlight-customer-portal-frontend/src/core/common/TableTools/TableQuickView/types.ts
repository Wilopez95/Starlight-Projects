import { BaseEntity } from '@root/core/stores/base/BaseEntity';
import { BaseStore } from '@root/core/stores/base/BaseStore';
import { IEntity } from '@root/core/types';

import TableQuickViewStyles from './css/styles.scss';

export type QuickViewSize =
  | 'full'
  | 'three-quarters'
  | 'half'
  | 'moderate'
  | 'middle-fixed'
  | 'default';

export interface ITableQuickView {
  parentRef: React.MutableRefObject<HTMLElement | null>;
  clickOutContainers?:
    | React.MutableRefObject<HTMLElement | null>[]
    | React.MutableRefObject<HTMLElement | null>;
  size?: QuickViewSize;
  quickViewClassName?: string;
  confirmModal?: boolean;
  confirmModalText?: string;
  clickOutSelectors?: string[];
  closeOnClickOut?: boolean;
  children(data: QuickViewChildrenFunction): React.ReactNode;
  store?: BaseStore<IEntity>;
  saveChanges?(onCancel: () => void, closeConfirmModal?: () => void): void;
  clickOutHandler?(): void;
  onCancel?(showModal?: any): void;
}

type QuickViewChildrenFunction = {
  scrollContainerHeight: number;
  tableQuickViewStyles: typeof TableQuickViewStyles;
  onCancel(showModal?: any): void;
  onAddRef(ref: HTMLElement | null): void;
};

export interface IBaseQuickView {
  tbodyContainerRef: React.MutableRefObject<HTMLDivElement | null>;
  tableScrollContainerRef: React.MutableRefObject<HTMLDivElement | null>;
  newButtonRef: React.MutableRefObject<HTMLButtonElement | null>;
  store: BaseStore<BaseEntity>;
}
