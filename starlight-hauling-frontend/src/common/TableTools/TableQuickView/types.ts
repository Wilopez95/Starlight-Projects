import { BaseEntity } from '@root/stores/base/BaseEntity';
import { BaseStore } from '@root/stores/base/BaseStore';
import { IEntity } from '@root/types';

import TableQuickViewStyles from './css/styles.scss';

export type QuickViewSize = 'full' | 'three-quarters' | 'half' | 'moderate' | 'default';

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
  onCancel?(showModal?: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
}

type QuickViewChildrenFunction = {
  scrollContainerHeight: number;
  tableQuickViewStyles: typeof TableQuickViewStyles;
  onCancel(showModal?: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
  onDuplicate(): void;
  onAddRef(ref: HTMLElement | null): void;
};

export interface IBaseQuickView {
  tbodyContainerRef: React.MutableRefObject<HTMLDivElement | null>;
  tableScrollContainerRef: React.MutableRefObject<HTMLDivElement | null>;
  store: BaseStore<BaseEntity>;
  newButtonRef: React.MutableRefObject<HTMLButtonElement | null>;
}
