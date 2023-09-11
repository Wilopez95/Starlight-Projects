import { NavigationConfigItem } from '@starlightpro/shared-components';

import { LineItem, Material } from '@root/stores/entities';

export interface ILineItemForm {
  currentMaterialNavigation?: NavigationConfigItem;
  materials?: Material[];
  lineItems?: LineItem[];
  onMaterialChange(config: NavigationConfigItem): void;
}
