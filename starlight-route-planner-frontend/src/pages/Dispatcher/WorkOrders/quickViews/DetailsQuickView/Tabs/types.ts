import { IWorkOrder } from '@root/types';

export interface ITabs {
  workOrder: IWorkOrder;
  scrollContainerHeight: number;
  onEdit?(): void;
  onAddRef?(ref: HTMLElement | null): void;
}
