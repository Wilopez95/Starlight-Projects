import { IOrderHistoryItem, OrderHistoryEntityType } from '../types';

export interface IBaseOrderHistoryChange<New, Prev = New, PopNew = undefined, PopPrev = PopNew> {
  prevValue: Prev;
  newValue: New;
  populated: PopNew extends undefined
    ? any
    : {
        prevValue: PopPrev;
        newValue: PopNew;
      };
}

export type OrderHistoryItemEntityResolver = (
  entityType: OrderHistoryEntityType,
) => (historyItem: IOrderHistoryItem) => React.ReactNode;
