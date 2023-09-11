import { type JsonConversions } from '@root/types';
import { IQbIntegrationLog } from '../../types/entities/qbIntegrationLog';
import { BaseEntity } from '../base/BaseEntity';
import { QbIntegrationLogStore } from './QbIntegrationLogStore';

export class QbIntegrationLog extends BaseEntity implements IQbIntegrationLog {
  type: string;

  lastSuccessfulIntegration: string;

  rangeFrom: string;

  rangeTo: string;

  integrationBuList: string[];

  paymentsTotal: string;

  statusCode: string;

  description: string;

  store: QbIntegrationLogStore;

  constructor(store: QbIntegrationLogStore, entity: JsonConversions<IQbIntegrationLog>) {
    super(entity);
    this.store = store;
    this.id = entity.id;
    this.type = entity.type;
    this.lastSuccessfulIntegration = entity.lastSuccessfulIntegration;
    this.rangeFrom = entity.rangeFrom;
    this.rangeTo = entity.rangeTo;
    this.integrationBuList = entity.integrationBuList;
    this.paymentsTotal = entity.paymentsTotal;
    this.statusCode = entity.statusCode;
    this.description = entity.description;
  }
}
