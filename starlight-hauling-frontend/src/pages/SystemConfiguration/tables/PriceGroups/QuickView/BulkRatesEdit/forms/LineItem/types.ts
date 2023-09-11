import { NavigationConfigItem } from '@starlightpro/shared-components';

import { LineItem, Material } from '@root/stores/entities';

export interface ILineItemForm {
  currentMaterialNavigation?: NavigationConfigItem<string>;
  materials?: Material[];
  lineItems?: LineItem[];
  onMaterialChange(config: NavigationConfigItem<string>): void;
}
