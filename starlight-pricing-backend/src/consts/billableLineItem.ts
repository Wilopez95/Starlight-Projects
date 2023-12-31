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
