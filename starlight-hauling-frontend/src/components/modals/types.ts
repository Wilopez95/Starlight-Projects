import { IModal } from '@root/common/Modal/types';

export interface IFormModal<T> extends IModal {
  onFormSubmit(values: T): void;
  onClose(): void;
  half?: boolean;
  fullSize?: boolean;
}
