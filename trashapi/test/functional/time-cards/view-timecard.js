import assert from 'assert';
import { format } from 'date-fns';
import { clear } from '../../helpers/data';
import { body, expect } from '../../helpers/request';

const startTime = format(new Date(), 'yyyy-MM-dd HH:mm:ss');

export const before = async api => {
  await api.createTimecard().send({ startTime });
};

export const after = clear;

export default {
  [`view time card`]: async (request, api) => {
    const [timecard] = await body(api.listTimecards());

    const returnedTimecard = await body(expect(200, request({ timeCardId: timecard.id })));

    assert.deepEqual(returnedTimecard, timecard);

    assert.ok(timecard.id);
    assert.ok(timecard.startTime);
    assert.ok(timecard.stopTime === null);
    assert.ok(timecard.driver.id === null);
    assert.ok(timecard.driver.name === null);
    assert.ok(timecard.driver.truck.id === null);
  },
};
