import assert from 'assert';
import R from 'ramda';
import { format } from 'date-fns';
import { clear, all, isOdd, odds, evens } from '../../helpers/data';
import { body, expect } from '../../helpers/request';
import { foldP } from '../../../src/utils/functions';
import { dateFrmt } from '../../../src/utils/format';

export const afterEach = clear;
const startTime = format(new Date(), 'yyyyy-MM-dd HH:mm:ss');

const createTimecards = (api, genTimecard = () => ({})) =>
  foldP(
    async (acc, i) => R.append(await body(api.createTimecard().send({ ...genTimecard(i) })), acc),
    [],
    R.times(R.identity, all),
  );

const startTimes = [
  1478613699000, // "2016-11-08 14:01:39", //GMT
  1478599200000, // "2016-11-08 10:00:00",
  1478678400000, // "2016-11-09 08:00:00",
  1478613599000, // "2016-11-08 13:59:59",
  1478577600000, // "2016-11-08 04:00:00"
];

const stopTimes = [
  1478599200000, // "2016-11-08 10:00:00",
  1478613699000, // "2016-11-08 14:01:39",
  1478476800000, // "2016-11-07 08:08:13",
  1478584800000, // "2016-11-08 06:00:00",
  1478599200000, // "2016-11-08 10:00:00"
];

const fetchByDriver = (field, column) => async (request, api) => {
  const driverA = await body(api.createDriver().send({ name: 'A' }));
  const driverB = await body(api.createDriver().send({ name: 'B' }));

  await createTimecards(api, i => ({
    driverId: isOdd(i) ? driverA.id : driverB.id,
    startTime,
  }));

  const listOfTimeCardsForDriverA = await body(
    expect(
      200,
      request().query({
        [field]: driverA[column],
      }),
    ),
  );
  assert.equal(listOfTimeCardsForDriverA.length, odds);

  const listOfTimeCardsForDriverB = await body(
    expect(
      200,
      request().query({
        [field]: driverB[column],
      }),
    ),
  );
  assert.equal(listOfTimeCardsForDriverB.length, evens);
};

export default {
  [`fetch all time cards`]: async (request, api) => {
    const testTimeCards = await createTimecards(api, () => ({
      startTime,
    }));

    const listOfTimeCards = await body(expect(200, request()));

    assert.deepEqual(testTimeCards, listOfTimeCards);
  },

  [`fetch by driverId`]: fetchByDriver('driverId', 'id'),

  [`fetch deleted`]: async (request, api) => {
    const driver = await body(api.createDriver().send({ name: 'A' }));

    const { body: timecard } = await api.createTimecard().send({
      driverId: driver.id,
      startTime,
    });

    await api.deleteTimecard({ timeCardId: timecard.id }).query();

    const { body: timecards } = await request().query({
      deleted: 1,
    });

    const [deletedTimecard] = timecards;

    assert.equal(deletedTimecard.id, timecard.id);
    assert.equal(deletedTimecard.deleted, 1);
  },

  [`fetch deleted with flag 0`]: async (request, api) => {
    const driver = await body(api.createDriver().send({ name: 'A' }));

    const { body: timecard } = await api.createTimecard().send({
      driverId: driver.id,
      startTime,
    });

    await api.deleteTimecard({ timeCardId: timecard.id }).query();

    const { body: timecards } = await request().query({
      deleted: 0,
    });

    assert.equal(timecards.length, 0);
  },

  [`fetch by driverName`]: fetchByDriver('driverName', 'name'),

  [`API-204 should search by timecards by startTime and stopTime
    between two dates -- have high precise`]: async (request, api) => {
    await createTimecards(api, i => ({
      startTime: dateFrmt(startTimes[i]),
      stopTime: dateFrmt(stopTimes[i]),
    }));

    const { body: timecards } = await expect(
      200,
      request().query({
        date: '1478476800000..1478476800000', // 2016-11-07 08:08:13.000..2016-11-07 08:08:13.000
      }),
    );

    assert.equal(timecards.length, 1, '1 timecard');
  },

  [`API-221 should search timecards by startTime and stopTime
    between two dates -- include incompleted`]: async (request, api) => {
    await createTimecards(api, i => ({
      startTime: dateFrmt(startTimes[i]),
      stopTime: dateFrmt(stopTimes[i]),
    }));
    await api.createTimecard().send({
      startTime: 1478376800000,
      stopTime: null,
    });

    const { body: timecards } = await expect(
      200,
      request().query({
        date: '1478376800000..1478476800000',
      }),
    );

    assert.equal(timecards.length, 2, '2 timecard');
  },

  [`API-204 should search by timecards by startTime and stopTime
    between two dates -- return several values`]: async (request, api) => {
    await createTimecards(api, i => ({
      startTime: dateFrmt(startTimes[i]),
      stopTime: dateFrmt(stopTimes[i]),
    }));

    const { body: timecards } = await expect(
      200,
      request().query({
        date: '1478570300000..1478613700000', // 2016-11-8 3:58:20.000..2016-11-8 14:01:40.000
      }),
    );

    assert.equal(timecards.length, 4, '4 timecards');
  },

  [`API-204 should search by timecards by startTime and stopTime
    between two dates -- return 0 values if there is not any`]: async (request, api) => {
    await createTimecards(api, i => ({
      startTime: dateFrmt(startTimes[i]),
      stopTime: dateFrmt(stopTimes[i]),
    }));

    const { body: timecards } = await expect(
      200,
      request().query({
        date: '1478604960000..1478605020000', // 2016-11-8 11:36:00.000..2016-11-8 11:37:00.000
      }),
    );

    assert.equal(timecards.length, 0, 'there are not timecards');
  },
};
