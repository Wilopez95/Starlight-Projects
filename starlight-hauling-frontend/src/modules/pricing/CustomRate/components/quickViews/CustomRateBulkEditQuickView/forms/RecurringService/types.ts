import { NavigationConfigItem } from '@starlightpro/shared-components';

import { BillableService, EquipmentItem, LineItem, Material } from '@root/stores/entities';

export interface IRecurringServiceForm {
  currentEquipmentItemNavigation?: NavigationConfigItem<string>;
  currentMaterialNavigation?: NavigationConfigItem;
  materials?: Material[];
  equipments?: EquipmentItem[];
  services?: BillableService[];
  lineItems?: LineItem[];
  onMaterialChange(config: NavigationConfigItem): void;
  onEquipmentItemChange(config: NavigationConfigItem): void;
}
