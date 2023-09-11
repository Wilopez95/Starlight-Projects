import { IOrderBy } from './GeneralsFilter';

export interface IGetSubscriptionByStatus {
  subscriptionIds: number[];
  columnName: string;
  orderBy?: IOrderBy;
  condition: string;
  statuses: string[];
}
