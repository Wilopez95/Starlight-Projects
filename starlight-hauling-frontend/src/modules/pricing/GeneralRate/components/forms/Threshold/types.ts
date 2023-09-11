import { NavigationConfigItem } from '@starlightpro/shared-components';

import { IThresholdGeneralRate } from '@root/modules/pricing/GeneralRate/types';
import { IRatesHistoryRequest } from '@root/modules/pricing/types';
import { ThresholdSettingsType } from '@root/types';

export interface IThresholdGeneralRateFormikData {
  threshold: IThresholdGeneralRate[];
}

export interface IThresholdForm {
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
