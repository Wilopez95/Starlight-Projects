import { IWorkOrder } from '@root/types';

export interface IForm {
  scrollContainerHeight: number;
  workOrder: IWorkOrder;
  onAddRef(ref: HTMLElement | null): void;
  onClose(workOrder?: IWorkOrder): void;
}
