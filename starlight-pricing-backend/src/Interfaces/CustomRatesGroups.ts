import { CustomRatesGroupLineItems } from '../database/entities/tenant/CustomRatesGroupLineItems';
import { CustomRatesGroups } from '../database/entities/tenant/CustomRatesGroups';
import { CustomRatesGroupServices } from '../database/entities/tenant/CustomRatesGroupServices';
import { CustomRatesGroupSurcharges } from '../database/entities/tenant/CustomRatesGroupSurcharges';
import { CustomRatesGroupThresholds } from '../database/entities/tenant/CustomRatesGroupThresholds';
import { ICustomer } from './Customer';
import { IGetJobSiteDataResponse, IJobSite } from './JobSite';
import { IServiceAreasCustomRatesGroup } from './ServiceAreasCustomRatesGroup';
import { ThresholdSettingsType } from './ThresholdSettings';

export interface ICustomRatesGroupsResponse extends CustomRatesGroups {
  serviceAreaIds: number[];
}
export interface ICustomRatesGroups {
  id: number;
  description: string;
  startDate: Date | null;
  endDate: Date | null;
  validDays: number[];
  active: boolean;
  overweightSetting: ThresholdSettingsType | string;
  usageDaysSetting: ThresholdSettingsType | string;
  demurrageSetting: ThresholdSettingsType | string;
  dumpSetting: ThresholdSettingsType | string;
  loadSetting: ThresholdSettingsType | string;
  customerGroupId?: number | null;
  customerJobSiteId?: number | null;
  customerId?: number | null;
  serviceAreaIds?: number[] | IServiceAreasCustomRatesGroup[] | null;
  nonServiceHours?: boolean;
  spUsed: boolean;
  businessUnitId: number | undefined;
  businessLineId: number | undefined;
}

export interface ICustomRatesGroupsResolver {
  skip?: number;
  businessLineId?: number;
  businessUnitId?: number;
  active?: boolean;
  id?: number;
  type?: string;
  serviceAreaIds?: number[];
  limit?: number;
}

export interface ICustomRatesGroupsRepo extends CustomRatesGroups {
  serviceAreaIds: number[];
}

export type TypeMapDuplicatedItemsWithBULoB =
  | CustomRatesGroupServices[]
  | CustomRatesGroupLineItems[]
  | CustomRatesGroupThresholds[]
  | CustomRatesGroupSurcharges[];

export interface IGetCustomRatesGroupsData extends CustomRatesGroups {
  customerJobSite: IGetJobSiteDataResponse;
  customer: ICustomer;
  jobSite: IJobSite;
}

export interface ICheckPriceGroupsBody {
  businessUnitId: number;
  businessLineId: number;
  serviceAreaIds?: number[];
}
