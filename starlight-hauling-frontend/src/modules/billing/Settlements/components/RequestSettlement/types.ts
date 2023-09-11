import { IModal } from '@root/common/Modal/types';
import { IMerchant } from '@root/types';

export interface IRequestSettlementData {
  date: Date;
  businessUnitId: number;
  merchantId: number;
  mid: string;
}

export interface IRequestSettlementModal extends IModal {
  businessUnitId: number;
  availableMerchants: IMerchant[];
}
