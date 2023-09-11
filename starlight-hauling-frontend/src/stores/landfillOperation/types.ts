import { AppliedFilterState } from '@root/common/TableTools/TableFilter';

export type LandfillOperationStoreSortType =
  | 'id'
  | 'date'
  | 'facility'
  | 'ticket'
  | 'customer'
  | 'order'
  | 'woNumber'
  | 'truck'
  | 'timeIn'
  | 'timeOut'
  | 'netWeight';

export type GetCountOptions = {
  businessUnitId: number;
  filterData?: AppliedFilterState;
  query?: string;
};

export interface ILandfillOperationRequestParams {
  businessUnitId: number;
  filterData?: AppliedFilterState;
  query?: string;
}
