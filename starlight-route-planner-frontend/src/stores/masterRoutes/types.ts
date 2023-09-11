import { IDropResult } from '@root/common/DragNDropList/types';

export interface IMasterRouteModalSettings {
  visible?: boolean;
  id?: number;
  activeTabIndex?: 0 | 1;
  pinData?: IDropResult;
}

export interface IServiceItemsAssignmentInfo {
  id: number;
  color: string;
  name?: string;
}

export interface IMasterRouteInfo {
  id?: number;
  color?: string;
  serviceDays?: number[];
}
export interface IMasterRouteGridItem {
  id: number;
  customerId: number;
  customerName: String;
  subscriptionId: String;
  jobSiteId: number;
  jobSiteName: String;
  serviceName: String;
  serviceFrequencyId: number;
  serviceFrequencyName: String;
  materialId: number;
  materialName: String;
  equipmentItemId: number;
  equipmentSize: String;
  currentRoute: String;
  currentSequence: number | null;
  currentServiceDay: number;
  routeId: number;
  masterRoute?: IMasterRouteInfo;
  newServiceDate?: number;
  newSequence?: number;
  newRoute?: number;
  serviceItemMasterRouteId?: number;
  top?: number;
  originalSequence?: number | null;
}

export interface IMasterRouteGridUpdateItems {
  id: number;
  serviceItemMasterRouteId?: number;
  newServiceDay?: number;
  newSequence?: number;
  newRoute?: number;
}

export interface IMasterRouteGridUpdate {
  data: IMasterRouteGridUpdateItems[];
}
