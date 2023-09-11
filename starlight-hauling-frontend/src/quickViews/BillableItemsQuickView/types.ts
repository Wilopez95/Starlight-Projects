import { NavigationConfigItem } from '@starlightpro/shared-components';

import { BillableServiceStore } from '@root/stores/billableService/BillableServiceStore';
import { BillableService, LineItem, Threshold } from '@root/stores/entities';
import { LineItemStore } from '@root/stores/lineItem/LineItemStore';
import { SurchargeStore } from '@root/stores/surcharge/SurchargeStore';
import { ThresholdStore } from '@root/stores/threshold/ThresholdStore';
import { IBillableService, ILineItem, ISurcharge, IThreshold } from '@root/types';

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

export interface IBillableItemQuickView {
  store: LineItemStore | BillableServiceStore | ThresholdStore | SurchargeStore;
  selectedTab: BillableItemTypes;
  quickViewSubtitle?: string;
}

export type EntityType = IBillableService | ILineItem | IThreshold | ISurcharge;
