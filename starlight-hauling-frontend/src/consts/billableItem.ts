import { ISelectOption } from '@starlightpro/shared-components';
import { startCase } from 'lodash-es';

import { normalizeOptions } from '@root/helpers/normalizeOptions';
import { type BillableLineItemType, type ThresholdSettingsType } from '@root/types';

import { isCore } from './env';

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

export enum AutopayEnum {
  invoiceDue = 'invoiceDue',
  lastInvoice = 'lastInvoice',
  accountBalance = 'accountBalance',
}

export const billingCycles: BillingCycleEnum[] = [
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
  nonService = 'notService',
  dump = 'dump',
  load = 'load',
}

export const ChangePortableToiletPositionActions = [
  BillableItemActionEnum.switch,
  BillableItemActionEnum.dumpReturn,
  BillableItemActionEnum.liveLoad,
  BillableItemActionEnum.reposition,
  BillableItemActionEnum.relocate,
];

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

export const recyclingLineItemOptions: BillableLineItemType[] = ['none', 'miscellaneousItem'];

export enum BillableLineItemUnitTypeEnum {
  NONE = 'none',
  EACH = 'each',
  TON = 'ton',
  YARD = 'yard',
  GALLON = 'gallon',
  MILE = 'mile',
  MIN = 'min',
  HOUR = 'hour',
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  ORDER = 'order',
}

export const unitOptions = normalizeOptions([
  BillableLineItemUnitTypeEnum.NONE,
  BillableLineItemUnitTypeEnum.EACH,
  BillableLineItemUnitTypeEnum.TON,
  BillableLineItemUnitTypeEnum.YARD,
  { value: BillableLineItemUnitTypeEnum.GALLON, label: 'Gallon' },
  BillableLineItemUnitTypeEnum.MILE,
  { value: BillableLineItemUnitTypeEnum.MIN, label: 'Minute' },
  BillableLineItemUnitTypeEnum.HOUR,
  BillableLineItemUnitTypeEnum.DAY,
]);

export const metricUnitOptions = normalizeOptions([
  BillableLineItemUnitTypeEnum.NONE,
  BillableLineItemUnitTypeEnum.EACH,
  { value: BillableLineItemUnitTypeEnum.TON, label: 'Tonne' },
  { value: BillableLineItemUnitTypeEnum.YARD, label: 'Meter' },
  { value: BillableLineItemUnitTypeEnum.GALLON, label: 'Gallon' },
  BillableLineItemUnitTypeEnum.MILE,
  { value: BillableLineItemUnitTypeEnum.MIN, label: 'Minute' },
  BillableLineItemUnitTypeEnum.HOUR,
  BillableLineItemUnitTypeEnum.DAY,
]);

export const recyclingUnitOptions = normalizeOptions([
  BillableLineItemUnitTypeEnum.NONE,
  BillableLineItemUnitTypeEnum.EACH,
  BillableLineItemUnitTypeEnum.TON,
  BillableLineItemUnitTypeEnum.YARD,
  BillableLineItemUnitTypeEnum.MILE,
  { value: BillableLineItemUnitTypeEnum.MIN, label: 'Minute' },
  BillableLineItemUnitTypeEnum.HOUR,
  BillableLineItemUnitTypeEnum.DAY,
  BillableLineItemUnitTypeEnum.WEEK,
  BillableLineItemUnitTypeEnum.MONTH,
  BillableLineItemUnitTypeEnum.ORDER,
]);

export const recyclingMetricUnitOptions = normalizeOptions([
  BillableLineItemUnitTypeEnum.NONE,
  BillableLineItemUnitTypeEnum.EACH,
  { value: BillableLineItemUnitTypeEnum.TON, label: 'Tonne' },
  { value: BillableLineItemUnitTypeEnum.YARD, label: 'Meter' },
  BillableLineItemUnitTypeEnum.MILE,
  { value: BillableLineItemUnitTypeEnum.MIN, label: 'Minute' },
  BillableLineItemUnitTypeEnum.HOUR,
  BillableLineItemUnitTypeEnum.DAY,
  BillableLineItemUnitTypeEnum.WEEK,
  BillableLineItemUnitTypeEnum.MONTH,
  BillableLineItemUnitTypeEnum.ORDER,
]);

export const actionOptions = normalizeOptions(
  isCore
    ? [
        BillableItemActionEnum.delivery,
        BillableItemActionEnum.switch,
        BillableItemActionEnum.final,
        BillableItemActionEnum.relocate,
        BillableItemActionEnum.reposition,
        { value: BillableItemActionEnum.dumpReturn, label: 'Dump & Return' },
        { value: BillableItemActionEnum.liveLoad, label: 'Live Load' },
        BillableItemActionEnum.generalPurpose,
      ]
    : [
        BillableItemActionEnum.none,
        BillableItemActionEnum.delivery,
        BillableItemActionEnum.switch,
        BillableItemActionEnum.final,
        BillableItemActionEnum.relocate,
        BillableItemActionEnum.reposition,
        { value: BillableItemActionEnum.dumpReturn, label: 'Dump & Return' },
        { value: BillableItemActionEnum.liveLoad, label: 'Live Load' },
        BillableItemActionEnum.generalPurpose,
      ],
);

export const recyclingActionOptions = normalizeOptions([
  BillableItemActionEnum.dump,
  BillableItemActionEnum.load,
]);

export const recurringActionOptions = normalizeOptions([
  BillableItemActionEnum.rental,
  { value: BillableItemActionEnum.service, label: 'Servicing' },
]);

export const actionLabelsOverrides = {
  [BillableItemActionEnum.dumpReturn]: 'Dump & Return',
  [BillableItemActionEnum.service]: 'Servicing',
  [BillableItemActionEnum.liveLoad]: 'Live Load',
  [BillableItemActionEnum.generalPurpose]: 'General Purpose',
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

export const autopayOptions: ISelectOption[] = [
  { value: AutopayEnum.invoiceDue, label: startCase(AutopayEnum.invoiceDue) },
  { value: AutopayEnum.lastInvoice, label: startCase(AutopayEnum.lastInvoice) },
  { value: AutopayEnum.accountBalance, label: startCase(AutopayEnum.accountBalance) },
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
  surcharge = 'surcharge',
}

export const enum SurchargeCalculation {
  Flat = 'flat',
  Percentage = 'percentage',
}
