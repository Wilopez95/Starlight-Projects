import { Dispatch, SetStateAction } from 'react';
import { NavigationConfigItem } from '@starlightpro/shared-components';

import { IRecurringServiceGeneralRate } from '@root/modules/pricing/GeneralRate/types';
import { IRatesHistoryRequest } from '@root/modules/pricing/types';

import { GeneralRateType } from '../types';

export interface IRecurringServiceGeneralRateFormikData {
  recurringService: IRecurringServiceGeneralRate[];
}

export interface IRecurringServiceForm {
  currentEquipmentItemNavigation?: NavigationConfigItem<string>;
  currentMaterialNavigation?: NavigationConfigItem;
  onMaterialChange(config: NavigationConfigItem): void;
  onEquipmentItemChange(config: NavigationConfigItem<string>): void;
  onShowRatesHistory(ratesHistoryParams: IRatesHistoryRequest, subTitle?: string): void;
  setInitialValues?: Dispatch<SetStateAction<Record<string, GeneralRateType[]> | undefined>>;
}
