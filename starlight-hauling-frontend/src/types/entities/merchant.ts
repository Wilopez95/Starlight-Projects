import { PaymentGateway } from '../enums';

import { type IEntity } from './';

export interface IMerchant extends IEntity {
  businessUnitId: number;
  paymentGateway: PaymentGateway;
  mid?: string | null;
  username?: string | null;
  password?: string | null;
  salespointMid?: string | null;
  salespointUsername?: string | null;
  salespointPassword?: string | null;
  coreMidConfirmed: boolean;
  spMidConfirmed: boolean;
}
