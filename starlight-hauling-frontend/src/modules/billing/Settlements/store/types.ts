import { IRangeCalendarValue } from '../../../../common/RangeCalendar/types';

export type SettlementRequestParams = IRangeCalendarValue & { businessUnitId: number };

export type SettlementCreateParams = {
  date: Date;
  merchantId: number;
  businessUnitId: number;
  mid: string;
};

export type SettlementSortType =
  | 'DATE'
  | 'PROCESSOR'
  | 'COUNT'
  | 'AMOUNT'
  | 'FEES'
  | 'ADJUSTMENT'
  | 'NET'
  | 'MERCHANT_ID';
