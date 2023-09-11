import { RequestQueryParams } from '@root/api/base';

export interface IRequestByBusinessUnitOrDate extends RequestQueryParams {
  buId: number | null;
  date: string;
  detailed?: boolean;
}
