import { type JsonConversions, IQbIntegration } from '@root/types';
import { BaseEntity } from '../base/BaseEntity';

import { QbIntegrationSettingsStore } from './QbIntegrationSettingsStore';

export class QbIntegrationSettings extends BaseEntity implements IQbIntegration {
  integrationBuList: string | number[];
  password: string;
  dateToAdjustment: number;
  lastSuccessfulIntegration?: string;
  description?: string;
  systemType?: string;
  integrationPeriod: string;
  accountReceivable?: string;
  defaultAccountIncome?: string;
  defaultAccountTax?: string;
  defaultPaymentAccount?: string;
  defaultAccountFinCharges?: string;
  writeoffAccount?: string;
  creditMemoAccount?: string;

  store: QbIntegrationSettingsStore;

  constructor(store: QbIntegrationSettingsStore, entity: JsonConversions<IQbIntegration>) {
    super(entity);

    this.store = store;
    this.id = entity.id;
    this.integrationBuList = entity.integrationBuList;
    this.dateToAdjustment = entity.dateToAdjustment;
    this.lastSuccessfulIntegration = entity.lastSuccessfulIntegration;
    this.description = entity.description;
    this.systemType = entity.systemType;
    this.integrationPeriod = entity.integrationPeriod;
    this.password = entity.password;
    this.accountReceivable = entity.accountReceivable;
    this.defaultAccountIncome = entity.defaultAccountIncome;
    this.defaultAccountTax = entity.defaultAccountTax;
    this.defaultPaymentAccount = entity.defaultPaymentAccount;
    this.defaultAccountFinCharges = entity.defaultAccountFinCharges;
    this.writeoffAccount = entity.writeoffAccount;
    this.creditMemoAccount = entity.creditMemoAccount;
  }
}
