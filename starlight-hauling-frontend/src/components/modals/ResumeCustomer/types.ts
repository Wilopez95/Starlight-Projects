import { IModal } from '@root/common/Modal/types';

export interface IResumeCustomerModal extends IModal {
  onCancel(): void;
  onSubmit(shouldUnholdTemplates: boolean): void;
}
