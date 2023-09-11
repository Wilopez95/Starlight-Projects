import { DailyRouteStatus, MasterRouteStatus, WorkOrderStatus } from '@root/consts';
import { IBaseInput } from '@root/types';

import { RouteType } from '../StatusBadge/types';

export type SelectValue = string;

export type StatusSelectItem =
  | keyof typeof MasterRouteStatus
  | keyof typeof DailyRouteStatus
  | keyof typeof WorkOrderStatus;

export type Option<L = string, V = StatusSelectItem> = {
  label: L;
  value: V;
};

export interface IStatusesSelect extends IBaseInput<SelectValue> {
  statuses: StatusSelectItem[];
  routeType: RouteType;
  values?: StatusSelectItem[];
  multiple?: boolean;
  borderless?: boolean;
  placeholder?: string;
  nonClearable?: boolean;
  onSelectChange(name: string, value?: SelectValue): void;
}
