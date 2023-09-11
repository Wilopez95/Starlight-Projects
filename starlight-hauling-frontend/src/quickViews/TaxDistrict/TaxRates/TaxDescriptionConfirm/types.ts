import { type IModal } from '@root/common/Modal/types';

export interface ITaxDescriptionConfirm extends IModal {
  taxDescriptionDirty: boolean;
  onTaxRatesSave(updateDescription?: boolean): void;
}
