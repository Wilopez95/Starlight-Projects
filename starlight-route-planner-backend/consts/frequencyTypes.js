export const FREQUENCY_TYPE = {
  xPerWeek: 'xPerWeek',
  everyXDays: 'everyXDays',
  onCall: 'onCall',
  xPerMonth: 'xPerMonth',
};

export const FREQUENCY_TYPES = Object.values(FREQUENCY_TYPE);

export const SERVICING_FREQUENCY_IDS = [1, 2, 3, 4, 5, 6, 7, 108];

export const FREQUENCIES_SEED_DATA = [];

const WEEK_DAYS_COUNT = 8;
const DAYS_FREQUENCY = 101;
const MONTH_FREQUENCY = 31;

for (let i = 1; i < WEEK_DAYS_COUNT; i++) {
  FREQUENCIES_SEED_DATA.push({
    times: i,
    type: FREQUENCY_TYPE.xPerWeek,
  });
}
for (let i = 1; i < DAYS_FREQUENCY; i++) {
  FREQUENCIES_SEED_DATA.push({
    times: i,
    type: FREQUENCY_TYPE.everyXDays,
  });
}
for (let i = 1; i < MONTH_FREQUENCY; i++) {
  FREQUENCIES_SEED_DATA.push({
    times: i,
    type: FREQUENCY_TYPE.xPerMonth,
  });
}

FREQUENCIES_SEED_DATA.push({
  type: FREQUENCY_TYPE.onCall,
});
