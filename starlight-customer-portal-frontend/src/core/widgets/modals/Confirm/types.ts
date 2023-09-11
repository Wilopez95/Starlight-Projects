import { IModal } from '@starlightpro/shared-components';

export interface IConfirmModal extends Omit<IModal, 'onClose'> {
  title: string;
  subTitle: string;
  cancelButton: string;
  submitButton: string;
  nonDestructive?: boolean;
  onCancel(): void;
  onSubmit(): void;
}
