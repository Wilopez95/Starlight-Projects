import { startCase } from 'lodash-es';

import { ISelectOption } from '@root/core/common/Select/types';
import { normalizeOptions } from '@root/core/helpers/normalizeOptions';

import { BillableLineItemType, ThresholdSettingsType } from '../types';

export enum BillingCycleEnum {
  daily = 'daily',
  weekly = 'weekly',
  _28days = '28days',
  monthly = 'monthly',
  quarterly = 'quarterly',
  yearly = 'yearly',
}

export enum BillingTypeEnum {
  arrears = 'arrears',
  inAdvance = 'inAdvance',
}

export type BillingCycle =
  | BillingCycleEnum.daily
  | BillingCycleEnum.weekly
  | BillingCycleEnum._28days
  | BillingCycleEnum.monthly
  | BillingCycleEnum.quarterly
  | BillingCycleEnum.yearly;

export const BillingCycles: BillingCycle[] = [
  BillingCycleEnum.daily,
  BillingCycleEnum.weekly,
  BillingCycleEnum._28days,
  BillingCycleEnum.monthly,
  BillingCycleEnum.quarterly,
  BillingCycleEnum.yearly,
];

export enum BillableItemActionEnum {
  none = 'none',
  delivery = 'delivery',
  switch = 'switch',
  final = 'final',
  relocate = 'relocate',
  reposition = 'reposition',
  dumpReturn = 'dump&Return',
  liveLoad = 'liveLoad',
  generalPurpose = 'generalPurpose',
  rental = 'rental',
  service = 'service',
}

export const CustomerOwnedEquipmentAllowedActions = [
  BillableItemActionEnum.none,
  BillableItemActionEnum.generalPurpose,
  BillableItemActionEnum.dumpReturn,
  BillableItemActionEnum.service,
];

export const typeOptions = ['service', 'lineItem'];

export const thresholdSettingTypeOptions: ThresholdSettingsType[] = [
  'global',
  'canSize',
  'canSizeAndMaterial',
  'material',
];

export const lineItemOptions: BillableLineItemType[] = [
  'none',
  'chargeback',
  'deposit',
  'financeCharge',
  'manifestedDisposalByTon',
  'manifestedDisposalByYard',
  'salesTax',
  'tripCharge',
  'writeOff',
];

export enum BillableLineItemUnitTypeEnum {
  NONE = 'none',
  EACH = 'each',
  TON = 'ton',
  YARD = 'yard',
  GALON = 'galon',
  MILE = 'mile',
  MIN = 'min',
  HOUR = 'hour',
  DAY = 'day',
}

export const unitOptions = normalizeOptions([
  BillableLineItemUnitTypeEnum.NONE,
  BillableLineItemUnitTypeEnum.EACH,
  BillableLineItemUnitTypeEnum.TON,
  BillableLineItemUnitTypeEnum.YARD,
  { value: BillableLineItemUnitTypeEnum.GALON, label: 'Gallon' },
  BillableLineItemUnitTypeEnum.MILE,
  { value: BillableLineItemUnitTypeEnum.MIN, label: 'Minute' },
  BillableLineItemUnitTypeEnum.HOUR,
  BillableLineItemUnitTypeEnum.DAY,
]);

export const actionOptions = normalizeOptions([
  BillableItemActionEnum.none,
  BillableItemActionEnum.delivery,
  BillableItemActionEnum.switch,
  BillableItemActionEnum.final,
  BillableItemActionEnum.relocate,
  BillableItemActionEnum.reposition,
  { value: BillableItemActionEnum.dumpReturn, label: 'Dump & Return' },
  BillableItemActionEnum.liveLoad,
  BillableItemActionEnum.generalPurpose,
]);

export const recurringActionOptions = normalizeOptions([
  BillableItemActionEnum.rental,
  { value: BillableItemActionEnum.service, label: 'Servicing' },
]);

export const actionLabelsOverrides = {
  [BillableItemActionEnum.dumpReturn]: 'Dump & Return',
  [BillableItemActionEnum.service]: 'Servicing',
};

export const billingCycleLabels = {
  [BillingCycleEnum.daily]: 'Daily',
  [BillingCycleEnum.weekly]: 'Weekly',
  [BillingCycleEnum._28days]: '28 Days',
  [BillingCycleEnum.monthly]: 'Monthly',
  [BillingCycleEnum.quarterly]: 'Quarterly',
  [BillingCycleEnum.yearly]: 'Yearly',
};

export const billingCyclesOptions: ISelectOption[] = [
  { value: BillingCycleEnum.daily, label: billingCycleLabels[BillingCycleEnum.daily] },
  { value: BillingCycleEnum.weekly, label: billingCycleLabels[BillingCycleEnum.weekly] },
  { value: BillingCycleEnum._28days, label: billingCycleLabels[BillingCycleEnum._28days] },
  { value: BillingCycleEnum.monthly, label: billingCycleLabels[BillingCycleEnum.monthly] },
  { value: BillingCycleEnum.quarterly, label: billingCycleLabels[BillingCycleEnum.quarterly] },
  { value: BillingCycleEnum.yearly, label: billingCycleLabels[BillingCycleEnum.yearly] },
];

export const billingTypesOptions: ISelectOption[] = [
  { value: BillingTypeEnum.arrears, label: startCase(BillingTypeEnum.arrears) },
  { value: BillingTypeEnum.inAdvance, label: startCase(BillingTypeEnum.inAdvance) },
];

export enum ProrationTypeEnum {
  servicesPerformed = 'servicesPerformed',
  usageDays = 'usageDays',
}

export const prorationTypes: ProrationTypeEnum[] = [
  ProrationTypeEnum.servicesPerformed,
  ProrationTypeEnum.usageDays,
];

export enum UpdateSubscriptionItemType {
  add = 'add',
  edit = 'edit',
  remove = 'remove',
}

export enum BillableItemType {
  service = 'service',
  lineItem = 'lineItem',
  threshold = 'threshold',
}
