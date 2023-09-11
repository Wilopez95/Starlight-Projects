import { NavigationConfigItem } from '@starlightpro/shared-components';

import { BillableService, EquipmentItem, LineItem, Material } from '@root/stores/entities';

export interface IServiceForm {
  currentMaterialNavigation?: NavigationConfigItem;
  currentEquipmentItemNavigation?: NavigationConfigItem<string>;
  materials?: Material[];
  equipments?: EquipmentItem[];
  services?: BillableService[];
  lineItems?: LineItem[];
  onMaterialChange(config: NavigationConfigItem): void;
  onEquipmentItemChange(config: NavigationConfigItem): void;
}
