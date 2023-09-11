import { Dispatch, SetStateAction } from 'react';
import { NavigationConfigItem } from '@starlightpro/shared-components';

import { IRecurringServiceCustomRate } from '@root/modules/pricing/CustomRate/types';
import { IRatesHistoryRequest } from '@root/modules/pricing/types';

import { FormikPriceGroupRate, PriceGroupRateType } from '../types';

export interface IRecurringServiceCustomRateFormikData {
  recurringService: FormikPriceGroupRate<IRecurringServiceCustomRate>[];
  bulkEnabled?: boolean;
  bulkOperation?: boolean;
  bulkValue?: string;
}

export interface IRecurringServiceForm {
  viewMode?: boolean;
  currentEquipmentItemNavigation?: NavigationConfigItem<string>;
  currentMaterialNavigation?: NavigationConfigItem;
  onMaterialChange(config: NavigationConfigItem): void;
  onEquipmentItemChange(config: NavigationConfigItem<string>): void;
  setInitialValues?: Dispatch<SetStateAction<Record<string, PriceGroupRateType[]> | undefined>>;
  onShowRatesHistory?(ratesHistoryParams: IRatesHistoryRequest, subTitle?: string): void;
}
