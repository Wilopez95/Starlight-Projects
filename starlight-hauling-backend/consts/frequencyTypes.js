export const FREQUENCY_TYPE = {
  xPerWeek: 'xPerWeek',
  everyXDays: 'everyXDays',
  onCall: 'onCall',
  xPerMonth: 'xPerMonth',
};

export const FREQUENCY_TYPES = Object.values(FREQUENCY_TYPE);

export const FREQUENCIES_SEED_DATA = [];

for (let i = 1; i < 8; i++) {
  FREQUENCIES_SEED_DATA.push({
    times: i,
    type: FREQUENCY_TYPE.xPerWeek,
  });
}
for (let i = 1; i < 101; i++) {
  FREQUENCIES_SEED_DATA.push({
    times: i,
    type: FREQUENCY_TYPE.everyXDays,
  });
}
for (let i = 1; i < 31; i++) {
  FREQUENCIES_SEED_DATA.push({
    times: i,
    type: FREQUENCY_TYPE.xPerMonth,
  });
}

FREQUENCIES_SEED_DATA.push({
  type: FREQUENCY_TYPE.onCall,
});
