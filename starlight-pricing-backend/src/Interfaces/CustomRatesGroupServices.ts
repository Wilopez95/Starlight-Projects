import { CustomRatesGroupRecurringServiceFrequency } from '../database/entities/tenant/CustomRatesGroupRecurringServiceFrequency';
import { Context } from './Auth';
import { IFrequency } from './Frequency';
import { IWhere } from './GeneralsFilter';

export interface ICustomRatesGroupServices {
  frequencies?: IFrequency[];
  price?: number | null;
  id: number;
  customRatesGroupId?: number;
  businessUnitId: number;
  businessLineId: number;
  description: string;
  customerId?: number;
  customerJobSiteId?: number;
  active?: boolean;
  validDays: number[];
  overweightSetting: string;
  startDate: Date;
  endDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  spUsed?: boolean;
  nonServiceHours?: boolean;
  serviceAreaIds?: number[];
}

export interface IUpsertManyCustomRatesGroupServices {
  where: IWhere;
  serviceRatesData: ICustomRatesGroupServices[];
  duplicate: boolean;
  ctx: Context;
}

export interface IRatesToRemoveCustomRatesGroupServices {
  customRatesGroupRecurringServiceId?: number;
  billableServiceFrequencyId?: number;
  billingCycle?: string;
}

export interface ICustomRatesServicesFrequenciesRelations
  extends CustomRatesGroupRecurringServiceFrequency {
  customRatesGroupRecurringServiceId: number;
}
