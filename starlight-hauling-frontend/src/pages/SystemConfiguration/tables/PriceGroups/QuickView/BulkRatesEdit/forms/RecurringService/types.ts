import { NavigationConfigItem } from '@starlightpro/shared-components';

import { BillableService, EquipmentItem, LineItem, Material } from '@root/stores/entities';

export interface IRecurringServiceForm {
  currentEquipmentItemNavigation?: NavigationConfigItem<string>;
  currentMaterialNavigation?: NavigationConfigItem<string>;
  materials?: Material[];
  equipments?: EquipmentItem[];
  services?: BillableService[];
  lineItems?: LineItem[];
  onMaterialChange(config: NavigationConfigItem<string>): void;
  onEquipmentItemChange(config: NavigationConfigItem<string>): void;
}
