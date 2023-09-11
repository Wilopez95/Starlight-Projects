import { IWorkOrder } from '@root/types';

export interface IDetailsQuickView {
  mainContainerRef: React.MutableRefObject<HTMLDivElement | null>;
}

export interface IForm {
  info: IWorkOrder;
  scrollContainerHeight: number;
  onAddRef(ref: HTMLElement | null): void;
  onClose(): void;
  onEdit(): void;
}
