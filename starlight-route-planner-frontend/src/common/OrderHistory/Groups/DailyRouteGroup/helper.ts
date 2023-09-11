import { TFunction } from 'i18next';
import { upperFirst } from 'lodash-es';

import { AvailableDailyRouteHistoryAttributes } from '@root/types';

import { HistoryEventType, HistoryEventTypeEnum } from '../../components/HistoryGroup/types';
import { HistoryActionType } from '../../helpers/historyActionType';

const I18N_PATH = 'Text.';

export const getSubjectMap = (
  t: TFunction,
  key: keyof typeof AvailableDailyRouteHistoryAttributes,
) => {
  return t(`${I18N_PATH}${upperFirst(key)}`);
};

export const mapEventTypeToAction = (eventType: HistoryEventType) => {
  switch (eventType) {
    case HistoryEventTypeEnum.create:
      return HistoryActionType.Added;
    case HistoryEventTypeEnum.generic:
      return HistoryActionType.Changed;
    case HistoryEventTypeEnum.delete:
      return HistoryActionType.Removed;
    default:
      return null;
  }
};
