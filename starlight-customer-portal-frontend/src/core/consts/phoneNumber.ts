import { normalizeOptions } from '@root/core/helpers/normalizeOptions';

export const phoneNumberPrimaryOptions = normalizeOptions([
  { value: 'main', label: 'Main', disabled: true },
  'home',
  'work',
  'cell',
  'other',
]);

export const phoneNumberSecondaryOptions = normalizeOptions(['home', 'work', 'cell', 'other']);
