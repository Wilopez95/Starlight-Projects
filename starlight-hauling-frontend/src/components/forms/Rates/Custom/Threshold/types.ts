import { NavigationConfigItem } from '@starlightpro/shared-components';

import { IRatesHistoryRequest } from '@root/api/priceGroup/types';
import { IPriceGroupRateThreshold, ThresholdSettingsType } from '@root/types';

import { FormikPriceGroupRate } from '../types';

export interface IPriceGroupRateThresholdFormikData {
  thresholds: FormikPriceGroupRate<IPriceGroupRateThreshold>[];
}

export interface IThresholdForm {
  viewMode?: boolean;
  currentEquipmentItemNavigation?: NavigationConfigItem<string>;
  currentMaterialNavigation?: NavigationConfigItem<string>;
  currentThresholdOption?: number;
  currentThresholdSetting?: ThresholdSettingsType;
  onMaterialChange(config?: NavigationConfigItem<string>): void;
  onEquipmentItemChange(config?: NavigationConfigItem<string>): void;
  onThresholdChange(option?: number): void;
  onThresholdSettingChange(setting?: ThresholdSettingsType): void;
  onShowRatesHistory(ratesHistoryParams: IRatesHistoryRequest, subTitle?: string): void;
}
