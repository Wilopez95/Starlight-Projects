import i18n from '../../i18n';
import { HaulingBillableItemUnit, HaulingMeasurementUnit } from '../../graphql/api';

export enum YardOperationConsoleTabs {
  Today = 'today',
  InYard = 'dumpAndLoad',
  OnTheWay = 'onTheWay',
  SelfService = 'selfService',
}

export const highlightColumns = [
  'material.description',
  'customer.businessName',
  'ticketNumber',
  'total',
  'customerTruck.truckNumber',
];

export const todaySearchFields = ['customer.businessName', 'customerTruck.truckNumber', 'id.raw'];

export const inYardAndOnTheWaySearchFields = [
  'customer.businessName',
  'customerTruck.truckNumber',
  'id.raw',
];

export const unitOfMeasurementTransMapping = {
  pound: i18n.t('Pound'),
  yard: i18n.t('Yard'),
  kilogram: i18n.t('Kilogram'),
  shortTons: i18n.t('Short Tons'),
  longTons: i18n.t('Long Tons'),
  tonnes: i18n.t('Tonnes'),
  tonne: i18n.t('Tonne'),
  meter: i18n.t('Meter'),
};

export const billableItemUnitTransMapping = {
  [HaulingBillableItemUnit.Ton]: i18n.t('Ton'),
  [HaulingBillableItemUnit.Each]: i18n.t('Each'),
  [HaulingBillableItemUnit.Mile]: i18n.t('Mile'),
  [HaulingBillableItemUnit.None]: i18n.t('None'),
  [HaulingBillableItemUnit.Min]: i18n.t('Min'),
  [HaulingBillableItemUnit.Day]: i18n.t('Day'),
  [HaulingBillableItemUnit.Gallon]: i18n.t('Gallon'),
  [HaulingBillableItemUnit.Hour]: i18n.t('Hour'),
  [HaulingBillableItemUnit.Month]: i18n.t('Month'),
  [HaulingBillableItemUnit.Order]: i18n.t('Order'),
  [HaulingBillableItemUnit.Week]: i18n.t('Week'),
  [HaulingBillableItemUnit.Yard]: unitOfMeasurementTransMapping.yard,
};

export const measurementUnitTonMap = {
  [HaulingMeasurementUnit.Imperial]: unitOfMeasurementTransMapping.longTons,
  [HaulingMeasurementUnit.Us]: unitOfMeasurementTransMapping.shortTons,
  [HaulingMeasurementUnit.Metric]: unitOfMeasurementTransMapping.tonnes,
};
