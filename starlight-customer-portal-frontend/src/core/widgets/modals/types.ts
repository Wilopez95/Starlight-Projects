import { IModal } from '@starlightpro/shared-components';

export interface IFormModal<T> extends IModal {
  onFormSubmit(values: T): void;
  onClose(): void;
}
