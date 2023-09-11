import {
  InformByEnum,
  SubscriptionHistoryActionEnum,
  SubscriptionHistoryAttributeEnum,
} from '@root/consts';
import { IFrequency } from '@root/types';

import { IEntity } from './entity';

export interface IReminderDescriptionValue extends Record<InformByEnum, boolean> {
  date: Date;
}

export type FrequencyDescriptionValue = Pick<IFrequency, 'id' | 'times' | 'type'>;

export interface IBestTimeToComeDescriptionValue {
  bestTimeToComeFrom: string | Date | null;
  bestTimeToComeTo: string | Date | null;
}

export type SubscriptionHistoryDescriptionValue =
  | string
  | boolean
  | number
  | Date
  | IReminderDescriptionValue
  | IBestTimeToComeDescriptionValue
  | FrequencyDescriptionValue;

export interface ISubscriptionHistoryDescription {
  quantity?: number;
  serviceName?: string;
  lineItemName?: string;
  subscriptionOrderName?: string;
  serviceDay?: number;
  newValue?: SubscriptionHistoryDescriptionValue;
  previousValue?: SubscriptionHistoryDescriptionValue;
  changeReasonDescription?: string | null;
  invoiceId?: number;
  billingPeriodFrom?: string;
  billingPeriodTo?: string;
  closeDate?: SubscriptionHistoryDescriptionValue;
}

export type SubscriptionHistoryEntity =
  | 'subscription'
  | 'recurrentService'
  | 'recurrentLineItem'
  | 'subscriptionOrder'
  | 'media';

export type SubscriptionHistoryAttribute =
  | SubscriptionHistoryEntity
  | 'jobSiteContact'
  | 'subscriptionContact'
  | 'purchaseOrder'
  | 'permit'
  | 'thirdPartyHauler'
  | 'customRatesGroup'
  | 'startDate'
  | 'endDate'
  | 'driverInstructions'
  | 'bestTimeToCome'
  | 'highPriority'
  | 'someoneOnSite'
  | 'material'
  | 'unlockOverrides'
  | 'serviceFrequency'
  | 'quantity'
  | 'serviceDate'
  | 'promo'
  | 'annualReminder'
  | 'serviceDay'
  | 'serviceDayRoute'
  | 'requiredByCustomer'
  | 'masterRoute'
  | 'csrComment';

export type SubscriptionHistoryAction = 'added' | 'changed' | 'removed' | 'other';

export type SubscriptionHistoryEntityAction =
  | 'subscriptionPlaced'
  | 'subscriptionDraftSaved'
  | 'putOnHold'
  | 'resume'
  | 'close'
  | 'clone';

export interface ISubscriptionHistoryRecord extends IEntity {
  subscriptionId: number;
  effectiveDate: Date | null;
  madeById: number | 'system' | null;
  madeBy: string;
  action: SubscriptionHistoryActionEnum;
  entity: SubscriptionHistoryEntity;
  entityAction: SubscriptionHistoryEntityAction | null;
  attribute: SubscriptionHistoryAttributeEnum;
  description: ISubscriptionHistoryDescription;
}

export interface ISubscriptionHistoryAvailableFilters {
  attributes: Record<SubscriptionHistoryAction, SubscriptionHistoryAttribute[]>;
  entityActions: Record<SubscriptionHistoryAction, SubscriptionHistoryEntityAction[]>;
  madeBy: {
    madeBy: string;
    madeById: string;
  }[];
}
