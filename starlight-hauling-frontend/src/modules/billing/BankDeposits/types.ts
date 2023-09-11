import { IBusinessUnit, IEntity } from '../../../types';
import { type GeneralPayment } from '../Payments/types';

export interface IBankDeposit extends IEntity {
  adjustments: number;
  date: Date;
  depositType: BankDepositType;
  status: BankDepositStatus;
  synced: boolean;
  total: number;
  count: number;
  merchantId?: string;
  businessUnit?: IBusinessUnit;
  payments?: GeneralPayment[];
}

export enum BankDepositType {
  cashCheck = 'CASH_CHECK',
  creditCard = 'CREDIT_CARD',
  reversal = 'REVERSAL',
}

export enum BankDepositStatus {
  locked = 'LOCKED',
  unLocked = 'UNLOCKED',
}

export type BankDepositRequestParams = {
  businessUnitId: string;
};

export type BankDepositSortType =
  | 'ID'
  | 'DATE'
  | 'DEPOSIT_TYPE'
  | 'MERCHANT_ID'
  | 'COUNT'
  | 'SYNC_WITH_QB'
  | 'STATUS'
  | 'TOTAL';
