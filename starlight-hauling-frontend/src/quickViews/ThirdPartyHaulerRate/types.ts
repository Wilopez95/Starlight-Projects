import { ISelectOption, NavigationConfigItem } from '@starlightpro/shared-components';

export interface IThirdPartyHaulerRateQuickViewRightPanel {
  businessLineId: number;
  businessLineOptions: ISelectOption[];
  currentMaterialNavigation?: NavigationConfigItem;
  currentEquipmentItemNavigation?: NavigationConfigItem<string>;
  onChangeBusinessLineId(name: string, value: number): void;
  onChangeEquipmentNavigation(config?: NavigationConfigItem<string>): void;
  onChangeMaterialNavigation(config?: NavigationConfigItem): void;
}
