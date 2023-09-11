import { type IModal } from '@root/common/Modal/types';

export interface IRemoveServiceAreaModal extends IModal {
  onRemove(): void;
}
