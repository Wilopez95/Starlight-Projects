import { IModal } from '@root/common/Modal/types';

export interface IEditPromoModal extends IModal {
  businessUnitId: number;
  businessLineId: number;
}

export interface IConfigurablePromo {
  promoId: number | null;
}
