import { IOrderHistoryItem } from '@root/types';

export interface IOrderHistoryGroup {
  timestamp: string;
  historyItems: IOrderHistoryItem[];
}

export interface IBaseOrderHistoryChange<New, Prev = New, Pop = undefined> {
  prevValue: Prev;
  newValue: New;
  populated: Pop extends undefined
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      any //it prevent a disaster
    : {
        prevValue: Pop;
        newValue: Pop;
      };
}

export interface IGroupedHistoryItems {
  mediaFiles: IOrderHistoryItem[];
  otherItems: IOrderHistoryItem[];
}
