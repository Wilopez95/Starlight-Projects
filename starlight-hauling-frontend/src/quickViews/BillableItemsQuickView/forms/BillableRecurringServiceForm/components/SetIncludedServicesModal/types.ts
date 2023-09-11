import { BillableItemActionEnum } from '@root/consts';

export interface IIncludedServicesModal {
  isOpen: boolean;
  equipmentItemId: number;
  services?: number[];
  billableItemAction?: BillableItemActionEnum;

  onClose(): void;

  onSave(services: number[]): void;
}
