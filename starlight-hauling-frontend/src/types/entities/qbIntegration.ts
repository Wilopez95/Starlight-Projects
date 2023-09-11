import { IEntity } from './entity';

export interface IQbIntegration extends IEntity {
  integrationBuList: number[] | string;
  password: string;
  dateToAdjustment: number;
  lastSuccessfulIntegration?: string;
  description?: string;
  systemType?: string;
  integrationPeriod: string | Date;
  accountReceivable?: string;
  defaultAccountIncome?: string;
  defaultAccountTax?: string;
  defaultPaymentAccount?: string;
  defaultAccountFinCharges?: string;
  writeoffAccount?: string;
  creditMemoAccount?: string;
}
