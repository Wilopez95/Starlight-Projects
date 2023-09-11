import { IModal } from '@starlightpro/shared-components';

export interface ITrucksModal extends IModal {
  businessLineId: number;
  isNew: boolean;
}
