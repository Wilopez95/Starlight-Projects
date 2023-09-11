import { BusinessLineTypeSymbol, DriverTruckRouteViolation, MasterRouteStatus } from '@root/consts';
import { ValidationMessageKeys } from '@root/pages/Dispatcher/MasterRouter/common/MasterRouteActions/types';

import { IDailyRoute } from './dailyRoute';
import { IEntity } from './entity';
import { IHaulingServiceItem } from './haulingServiceItem';

export interface IMasterRouteServiceItem extends IHaulingServiceItem {
  haulingId: number;
  sequence: number;
}

export interface IMasterRoute extends IEntity {
  name: string;
  published: boolean;
  serviceDaysList: number[];
  assignedServiceDaysList: number[];
  color: string;
  serviceItems: IMasterRouteServiceItem[];
  businessLineType?: BusinessLineTypeSymbol;
  status?: MasterRouteStatus;
  publishDate?: string | null;
  truckId?: string;
  businessUnitId?: number;
  driverId?: number;
  editingBy?: string | null;
  editorId?: string | null;
  violation?: DriverTruckRouteViolation[];
  // For local settings
  checked?: boolean;
}

export interface IUnpublishMasterRouteNotice {
  dailyRoutesToDeleteCount: number;
  editedDailyRoutes?: IDailyRoute[] | null;
  id?: number;
  name?: string;
}

export interface INoAssignedDriverTruckNotice {
  type: 'driver' | 'truck';
}

export interface IMasterRouteValidationModalData {
  validationKey: ValidationMessageKeys;
  routeName: string;
  items: IHaulingServiceItem[];
}

export interface IMasterRouteEditModeNotice {
  message: string;
  currentlyEditingBy: string;
  editorId: string;
  id?: number;
  name?: string;
}

export interface IHandleRouteStatus {
  routeStatus: string;
  routeName: string;
}

export const enum masterRouteSortKeys {
  customerName = 'customerName',
  subscriptionId = 'subscriptionId',
  jobSiteName = 'jobSiteName',
  serviceName = 'serviceName',
  serviceFrequencyName = 'serviceFrequencyName',
  materialName = 'materialName',
  equipmentSize = 'equipmentSize',
  currentRoute = 'currentRoute',
  currentSequence = 'currentSequence',
  currentServiceDay = 'currentServiceDay',
}
