import { NavigationConfigItem } from '@starlightpro/shared-components';

import { BillableService, LineItem, Threshold } from '@root/stores/entities';

export type BillableItem = BillableService | LineItem | Threshold;

export enum BillableItemType {
  service = 'service',
  recurringService = 'recurring',
  lineItem = 'lineItem',
  recurringLineItem = 'recurringLineItem',
  threshold = 'threshold',
  surcharge = 'surcharge',
}

export type BillableItemTypes =
  | BillableItemType.service
  | BillableItemType.recurringService
  | BillableItemType.lineItem
  | BillableItemType.recurringLineItem
  | BillableItemType.threshold
  | BillableItemType.surcharge;

export interface NavigationItem extends NavigationConfigItem<BillableItemTypes> {
  subtitle: string;
}
