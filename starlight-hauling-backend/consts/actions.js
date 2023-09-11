export const ONE_TIME_ACTION = {
  none: 'none',
  delivery: 'delivery',
  switch: 'switch',
  final: 'final',
  relocate: 'relocate',
  reposition: 'reposition',
  dumpReturn: 'dump&Return',
  liveLoad: 'liveLoad',
  generalPurpose: 'generalPurpose',
  notService: 'notService',
};

export const RECURRING_ACTION = {
  rental: 'rental',
  service: 'service',
};

export const RECYCLING_ACTION = {
  dump: 'dump',
  load: 'load',
};

export const ACTION = {
  ...ONE_TIME_ACTION,
  ...RECURRING_ACTION,
  ...RECYCLING_ACTION,
};

export const ONE_TIME_ACTIONS = Object.values(ONE_TIME_ACTION);
export const RECURRING_ACTIONS = Object.values(RECURRING_ACTION);
export const RECYCLING_ACTIONS = Object.values(RECYCLING_ACTION);
export const ACTIONS = Object.values(ACTION);
