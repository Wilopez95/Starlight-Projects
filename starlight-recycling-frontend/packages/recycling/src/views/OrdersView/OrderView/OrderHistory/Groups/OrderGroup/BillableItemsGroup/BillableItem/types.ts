import { HaulingBillableItem } from '../../../../../../../../graphql/api';
import { IBaseOrderHistoryChange } from '../../../types';

export interface IOrderHistoryBillableItemChanges
  extends IBaseOrderHistoryChange<string, string, HaulingBillableItem> {}
