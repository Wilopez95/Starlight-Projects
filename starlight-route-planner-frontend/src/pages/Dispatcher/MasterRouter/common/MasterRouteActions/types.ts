import { IDropResult } from '@root/common/DragNDropList/types';
import { IHaulingServiceItem, IMasterRoute } from '@root/types';

export type ActionsParams = Partial<IDropResult> &
  Pick<IMasterRoute, 'id' | 'published' | 'truckId' | 'driverId' | 'status' | 'name'>;

export type CheckValidDndParamsType = {
  ids: number[];
  serviceItems: IHaulingServiceItem[];
  routeName: string;
  serviceDaysList: number[];
};

export interface IMasterRouteActions {
  triggerEdit: (args: ActionsParams) => Promise<void>;
  triggerUnpublish: (args: ActionsParams) => Promise<void>;
  triggerPublish: (args: ActionsParams) => Promise<void>;
  checkIfValidDnd: (args: CheckValidDndParamsType) => void | boolean;
  checkIfCanUpdate: (id: number) => Promise<void>;
}

export enum ValidationMessageKeys {
  ServiceDays = 'ServiceDays',
  BusinessLine = 'BusinessLine',
}
