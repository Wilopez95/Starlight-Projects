import { IModal } from '@root/common/Modal/types';

export interface IDeleteMediaFileModal extends IModal {
  onCancel(): void;
  onSubmit(): void;
}
