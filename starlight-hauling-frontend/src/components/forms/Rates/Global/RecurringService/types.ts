import { Dispatch, SetStateAction } from 'react';
import { NavigationConfigItem } from '@starlightpro/shared-components';

import { IRatesHistoryRequest } from '@root/api/priceGroup/types';
import { IGlobalRateRecurringService } from '@root/types';

import { GlobalRateType } from '../types';

export interface IGlobalRateRecurringServiceFormikData {
  recurringServices: IGlobalRateRecurringService[];
}

export interface IRecurringServiceForm {
  currentEquipmentItemNavigation?: NavigationConfigItem<string>;
  currentMaterialNavigation?: NavigationConfigItem<string>;
  onMaterialChange(config: NavigationConfigItem<string>): void;
  onEquipmentItemChange(config: NavigationConfigItem<string>): void;
  onShowRatesHistory(ratesHistoryParams: IRatesHistoryRequest, subTitle?: string): void;
  setInitialValues?: Dispatch<SetStateAction<Record<string, GlobalRateType[]> | undefined>>;
}
