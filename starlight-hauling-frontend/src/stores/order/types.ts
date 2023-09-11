import { type AppliedFilterState } from '@root/common/TableTools/TableFilter';
import { OrderStoreStatusType } from '@root/types';

import { BillableService, Customer, EquipmentItem, JobSite, Material, User } from '../entities';

import { Order } from './Order';

export type OrderStoreCount = Record<OrderStoreStatusType | 'total' | 'filteredTotal', number>;

export type OrderReduceData = {
  customers: Customer[];
  jobSites: JobSite[];
  billableServices: BillableService[];
  equipmentItems: EquipmentItem[];
  users: User[];
  materials: Material[];
  orders: Order[];
};

export type OrderStoreSortType =
  | 'id'
  | 'customerName'
  | 'serviceDate'
  | 'woNumber'
  | 'service'
  | 'total'
  | 'jobSite'
  | 'status'
  | 'lineOfBusiness'
  | 'material';

export type RequestOptions = {
  businessUnitId: string;
  status: OrderStoreStatusType;
  mine: boolean;
  filterData?: AppliedFilterState;
  query?: string;
};

export type GetCountOptions = {
  businessUnitId: string | number;
  filterData?: AppliedFilterState;
  query?: string;
};
