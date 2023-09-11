import { AvailableDailyRouteHistoryAttributes } from '@root/types';

import { HistoryChanges } from '../../components/HistoryGroup/types';

export type DailyRouteHistoryChanges = HistoryChanges<
  keyof typeof AvailableDailyRouteHistoryAttributes
>;
