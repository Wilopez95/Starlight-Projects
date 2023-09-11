import { IEntity } from './entity';

export interface IQbIntegrationLog extends IEntity {
  type: string;
  lastSuccessfulIntegration: string;
  rangeFrom: string;
  rangeTo: string;
  integrationBuList: string[];
  paymentsTotal: string;
  statusCode: string;
  description: string;
}
