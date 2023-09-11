import { TFunction } from 'i18next';

import { ClientRequestType } from '@root/consts';
import { Regions } from '@root/i18n/config/region';
import { IntlConfig } from '@root/i18n/types';
import { Subscription } from '@root/stores/subscription/Subscription';
import { SubscriptionDraft } from '@root/stores/subscriptionDraft/SubscriptionDraft';
import {
  EquipmentItemType,
  IBillableService,
  IConfigurableReminderSchedule,
  IFrequency,
  IMaterial,
  IServiceItem,
  ISubscription,
  ISubscriptionDraft,
  ITaxDistrict,
} from '@root/types';

import { INewSubscriptionLineItem, INewSubscriptionOrder, INewSubscriptionService } from '../types';

export interface IMapSubscriptionToNewClientRequestInput {
  subscription: Subscription | SubscriptionDraft;
  taxDistricts: ITaxDistrict[];
  billableServices: IBillableService[];

  getServiceItemFrequencies(
    subscription: ISubscription | ISubscriptionDraft,
    serviceItem: IServiceItem,
  ): Promise<IFrequency[]>;

  getServiceItemMaterial(serviceItem: IServiceItem): Promise<IMaterial[]>;

  getShortDescription(serviceItem: IServiceItem): Promise<string | undefined>;

  getAnnualReminderConfig(entityId: number): Promise<IConfigurableReminderSchedule | undefined>;

  intl: IntlConfig;
  t: TFunction;
  canUnlockSubscriptionOverrides: boolean;
  region: Regions;
  equipmentType?: EquipmentItemType;
  isSubscriptionClone?: boolean;
}

export interface IMapSubscriptionToSubscriptionOrder {
  subscription: ISubscription;
  requestType: ClientRequestType.SubscriptionOrder | ClientRequestType.SubscriptionNonService;
}

export type SubscriptionOrderType =
  | ClientRequestType.SubscriptionOrder
  | ClientRequestType.SubscriptionNonService
  | null;

export interface IEffectiveDate {
  updatedAt: Date | string;
  effectiveDate?: Date | null;
}

export interface IGenerateServicePropPathInput {
  serviceIndex: number;
  property: keyof INewSubscriptionService;
}

export interface IGenerateLineItemPropPathInput {
  serviceIndex: number;
  property: keyof INewSubscriptionLineItem;
  lineItemIndex: number;
}

export interface IGenerateSubscriptionOrderPropPath {
  serviceIndex: number;
  property: keyof INewSubscriptionOrder;
  subscriptionOrderIndex: number;
}

export interface IGetFrequencyOptions {
  t: TFunction;
  frequencies: IFrequency[];
  serviceItem: IServiceItem;
}
