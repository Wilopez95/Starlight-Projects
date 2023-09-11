import { IModal } from '@root/common/Modal/types';

export interface IUnsavedChangesModal extends Omit<IModal, 'onClose'> {
  text?: string;
  onCancel(): void;
  onSubmit(): void;
}
