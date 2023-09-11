import { isNull } from 'lodash-es';

export enum HistoryActionType {
  Added = 'Added',
  Removed = 'Removed',
  Changed = 'Changed',
}

export const getHistoryActionType = (prevValue?: string, newValue?: string) => {
  if (isNull(prevValue) && !isNull(newValue)) {
    return HistoryActionType.Added;
  }

  if (!isNull(prevValue) && isNull(newValue)) {
    return HistoryActionType.Removed;
  }

  return HistoryActionType.Changed;
};
