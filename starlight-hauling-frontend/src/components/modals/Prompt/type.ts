import { IModal } from '@root/common/Modal/types';

export interface IPromptModal extends Omit<IModal, 'onClose'> {
  title: string;
  subTitle: string;
  submitButton: string;
  onSubmit(): void;
}
