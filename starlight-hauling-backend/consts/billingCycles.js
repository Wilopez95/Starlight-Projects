/* eslint-disable dot-notation */

import { FREQUENCY_TYPE } from './frequencyTypes.js';

export const BILLING_CYCLE = {
  daily: 'daily',
  weekly: 'weekly',
  monthly: 'monthly',
};

export const BILLING_CYCLES = Object.values(BILLING_CYCLE);

export const BILLABLE_ITEMS_BILLING_CYCLE = {
  daily: 'daily',
  weekly: 'weekly',
  monthly: 'monthly',
  '28days': '28days',
  quarterly: 'quarterly',
  yearly: 'yearly',
};

export const BILLABLE_ITEMS_BILLING_CYCLES = Object.values(BILLABLE_ITEMS_BILLING_CYCLE);

const frequencyConstraintsByBillingCycles = {
  [FREQUENCY_TYPE.everyXDays]: [
    BILLABLE_ITEMS_BILLING_CYCLE['daily'],
    BILLABLE_ITEMS_BILLING_CYCLE['weekly'],
    BILLABLE_ITEMS_BILLING_CYCLE['28days'],
    BILLABLE_ITEMS_BILLING_CYCLE['monthly'],
    BILLABLE_ITEMS_BILLING_CYCLE['quarterly'],
    BILLABLE_ITEMS_BILLING_CYCLE['yearly'],
  ],
  [FREQUENCY_TYPE.onCall]: [
    BILLABLE_ITEMS_BILLING_CYCLE['daily'],
    BILLABLE_ITEMS_BILLING_CYCLE['weekly'],
    BILLABLE_ITEMS_BILLING_CYCLE['28days'],
    BILLABLE_ITEMS_BILLING_CYCLE['monthly'],
    BILLABLE_ITEMS_BILLING_CYCLE['quarterly'],
    BILLABLE_ITEMS_BILLING_CYCLE['yearly'],
  ],
  [FREQUENCY_TYPE.xPerWeek]: [
    BILLABLE_ITEMS_BILLING_CYCLE['weekly'],
    BILLABLE_ITEMS_BILLING_CYCLE['28days'],
    BILLABLE_ITEMS_BILLING_CYCLE['monthly'],
    BILLABLE_ITEMS_BILLING_CYCLE['quarterly'],
    BILLABLE_ITEMS_BILLING_CYCLE['yearly'],
  ],
  [FREQUENCY_TYPE.xPerMonth]: [
    BILLABLE_ITEMS_BILLING_CYCLE['monthly'],
    BILLABLE_ITEMS_BILLING_CYCLE['quarterly'],
    BILLABLE_ITEMS_BILLING_CYCLE['yearly'],
  ],
};

export const BILLING_CYCLES_FREQUENCIES_SEED_DATA = Object.keys(
  frequencyConstraintsByBillingCycles,
).flatMap(frequencyType =>
  frequencyConstraintsByBillingCycles[frequencyType].map(billingCycle => ({
    frequencyType,
    billingCycle,
  })),
);

export const ALLOWED_BILLING_CYCLE_FOR_ANNIVERSARY_BILLING = [
  'weekly',
  'monthly',
  'quarterly',
  'yearly',
];

export const ALLOWED_BILLING_CYCLE_FOR_PRORATION = [
  'daily', // TODO: remove it after calculation refactoring on FE->BE integration side
  'weekly',
  'monthly',
  '28days',
  'quarterly',
  'yearly',
];

export const MAX_BILLING_CYCLE_COUNT = 100;

export const NOT_APPLICABLE_BILLING_CYCLE = ['monthly', 'quarterly', 'weekly', 'yearly'];
