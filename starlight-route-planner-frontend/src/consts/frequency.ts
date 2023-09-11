export const FREQUENCY = [
  ...Array.from({ length: 7 }, (_, i) => ({
    label: `${i + 1}x per week`,
    value: i + 1,
  })),
  {
    label: 'Monthly',
    value: 108,
  },
];

export const defaultFrequencyIds = FREQUENCY.map(frequency => frequency.value);
