import { IModal } from '@starlightpro/shared-components';

export interface IPromptModal extends Omit<IModal, 'onClose'> {
  title: string;
  subTitle: string;
  submitButton: string;
  onSubmit(): void;
}
