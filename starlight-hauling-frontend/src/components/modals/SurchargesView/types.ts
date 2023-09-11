import { IModal } from '@root/common/Modal/types';

export interface ISurchargesViewModal extends IModal {
  surchargesData: {
    surchargesTotal: number;
    orderSurcharges: ISurchargesOrderData[];
  };
  centered?: boolean;
}

export interface ISurchargesOrder {
  id: number;
  description: string;
  calculation: string;
  billableItemDescription: string;
  materialDescription: string;
  flatPrice: number;
  billableItemPrice: number;
  amount: number;
}

export interface ISurchargesOrderData {
  id: number;
  surchargeId: number;
  amount: number;
  material: {
    price: number;
    description: string;
  };
  billableService: {
    description: string;
  };
  globalRatesSurcharge: {
    price: number;
  };
}
