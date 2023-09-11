import { Dispatch, SetStateAction } from 'react';
import { NavigationConfigItem } from '@starlightpro/shared-components';

import { IRatesHistoryRequest } from '@root/api/priceGroup/types';
import { IPriceGroupRateRecurringService } from '@root/types';

import { FormikPriceGroupRate, PriceGroupRateType } from '../types';

export interface IPriceGroupRecurringServiceFormikData {
  recurringServices: FormikPriceGroupRate<IPriceGroupRateRecurringService>[];
  bulkEnabled?: boolean;
  bulkOperation?: boolean;
  bulkValue?: string;
}

export interface IRecurringServiceForm {
  viewMode?: boolean;
  currentEquipmentItemNavigation?: NavigationConfigItem<string>;
  currentMaterialNavigation?: NavigationConfigItem<string>;
  onMaterialChange(config: NavigationConfigItem<string>): void;
  onEquipmentItemChange(config: NavigationConfigItem<string>): void;
  setInitialValues?: Dispatch<SetStateAction<Record<string, PriceGroupRateType[]> | undefined>>;
  onShowRatesHistory?(ratesHistoryParams: IRatesHistoryRequest, subTitle?: string): void;
}
