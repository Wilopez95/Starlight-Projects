import { IModal } from '@starlightpro/shared-components';

export interface IUnsavedChangesModal extends Omit<IModal, 'onClose'> {
  text?: string;
  onCancel(): void;
  onSubmit(): void;
}
