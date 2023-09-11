import assert from 'assert';
import { addHours, formatISO } from 'date-fns';
import { clear } from '../../helpers/data';
import { dateFrmt } from '../../../src/utils/format';
import { body, expect } from '../../helpers/request';

const startTime = dateFrmt(new Date());
const stopTime = formatISO(addHours(new Date(), 5));

export const before = async api => {
  await api.createTimecard().send({ startTime });
};

export const after = clear;

export default {
  [`update time card`]: async (request, api) => {
    const [timecard] = await body(api.listTimecards());

    assert.equal(timecard.stopTime, null);

    assert.equal(timecard.startTime, formatISO(startTime), 'startTime before update');

    await body(expect(202, request({ timeCardId: timecard.id }).send({})));

    const updatedTimecard = await body(
      expect(
        202,
        request({ timeCardId: timecard.id }).send({
          stopTime,
        }),
      ),
    );

    assert.equal(timecard.id, updatedTimecard.id);
    assert.equal(timecard.createdDate, updatedTimecard.createdDate);
    assert.equal(timecard.startTime, formatISO(startTime), 'startTime after update');
    assert.equal(timecard.startTime, updatedTimecard.startTime);
    assert.equal(dateFrmt(updatedTimecard.stopTime), dateFrmt(stopTime));
  },
  [`update time card with startTime and stopTime`]: async (request, api) => {
    const newStartTime = formatISO(addHours(new Date(), 12));
    const [timecard] = await body(api.listTimecards());

    assert.equal(dateFrmt(timecard.stopTime), dateFrmt(stopTime));

    assert.equal(dateFrmt(timecard.startTime), dateFrmt(startTime), 'startTime before update');

    await body(expect(202, request({ timeCardId: timecard.id }).send({})));

    const updatedTimecard = await body(
      expect(
        202,
        request({ timeCardId: timecard.id }).send({
          startTime: newStartTime,
          stopTime,
        }),
      ),
    );

    assert.equal(timecard.id, updatedTimecard.id);
    assert.equal(timecard.createdDate, updatedTimecard.createdDate);
    assert.equal(
      dateFrmt(updatedTimecard.startTime),
      dateFrmt(newStartTime),
      'startTime after update',
    );
    assert.notEqual(timecard.startTime, updatedTimecard.startTime);
    assert.equal(dateFrmt(updatedTimecard.stopTime), dateFrmt(stopTime));
  },
};
