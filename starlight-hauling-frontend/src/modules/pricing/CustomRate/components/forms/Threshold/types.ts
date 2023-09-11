import { NavigationConfigItem } from '@starlightpro/shared-components';

import { IThresholdCustomRate } from '@root/modules/pricing/CustomRate/types';
import { IRatesHistoryRequest } from '@root/modules/pricing/types';
import { ThresholdSettingsType } from '@root/types';

import { FormikPriceGroupRate } from '../types';

export interface IThresholdCustomRateFormikData {
  threshold: FormikPriceGroupRate<IThresholdCustomRate>[];
}

export interface IThresholdForm {
  viewMode?: boolean;
  currentEquipmentItemNavigation?: NavigationConfigItem<string>;
  currentMaterialNavigation?: NavigationConfigItem;
  currentThresholdOption?: number;
  currentThresholdSetting?: ThresholdSettingsType;
  onMaterialChange(config?: NavigationConfigItem): void;
  onEquipmentItemChange(config?: NavigationConfigItem<string>): void;
  onThresholdChange(option?: number): void;
  onThresholdSettingChange(setting?: ThresholdSettingsType): void;
  onShowRatesHistory(ratesHistoryParams: IRatesHistoryRequest, subTitle?: string): void;
}
