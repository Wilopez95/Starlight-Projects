import { NavigationConfigItem } from '@starlightpro/shared-components';

import { IRatesHistoryRequest } from '@root/api/priceGroup/types';
import { IGlobalRateThreshold, ThresholdSettingsType } from '@root/types';

export interface IGlobalRateThresholdFormikData {
  thresholds: IGlobalRateThreshold[];
}

export interface IThresholdForm {
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
