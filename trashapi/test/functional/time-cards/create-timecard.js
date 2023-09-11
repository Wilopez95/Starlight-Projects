import assert from 'assert';
import { addHours, formatISO } from 'date-fns';
import { clear } from '../../helpers/data';
import { body, expect } from '../../helpers/request';
import { my } from '../../../src/utils/query';
import { dateFrmt } from '../../../src/utils/format';
import timecards from '../../../src/tables/timecards';

export const beforeEach = async api => {
  await api.createDriver().send({ name: 'Bob' });
};

export const afterEach = clear;

export default {
  [`create time card with empty startTime`]: async (request, api) => {
    const [driver] = await body(api.listDrivers());

    const timeCardMock = {
      driverId: driver.id,
    };

    const tcAPI = await body(expect(201, request().send(timeCardMock)));

    assert.ok(tcAPI.id);
    assert.equal(tcAPI.driver.id, driver.id);

    assert.equal(tcAPI.startTime, null);
  },
  [`create time card`]: async (request, api) => {
    const [driver] = await body(api.listDrivers());
    const startTime = new Date().toISOString();

    const timeCardMock = {
      driverId: driver.id,
      startTime,
    };

    const tcAPI = await body(expect(201, request().send(timeCardMock)));

    assert.ok(tcAPI.id);
    assert.equal(tcAPI.driver.id, driver.id);

    assert.equal(dateFrmt(tcAPI.startTime), dateFrmt(startTime));

    const [tcDB] = await my(timecards.select());

    assert.equal(tcDB.id, tcAPI.id);
    assert.equal(dateFrmt(tcDB.startTime), dateFrmt(tcAPI.startTime));
    assert.ok(tcDB.stopTime === null);
    assert.ok(tcAPI.stopTime === null);
    assert.equal(tcDB.stopTime, tcAPI.stopTime);
  },
  [`create time card with startTime and stopTime`]: async (request, api) => {
    const [driver] = await body(api.listDrivers());
    const startTime = new Date().toISOString();
    const stopTime = formatISO(addHours(new Date(), 5));

    const timeCardMock = {
      driverId: driver.id,
      startTime,
      stopTime,
    };

    const tcAPI = await body(expect(201, request().send(timeCardMock)));

    assert.ok(tcAPI.id);
    assert.equal(tcAPI.driver.id, driver.id);

    assert.equal(dateFrmt(tcAPI.startTime), dateFrmt(startTime));
    assert.equal(dateFrmt(tcAPI.stopTime), dateFrmt(stopTime));

    const [tcDB] = await my(timecards.select());

    assert.equal(tcDB.id, tcAPI.id);
    assert.equal(dateFrmt(tcDB.startTime), dateFrmt(tcAPI.startTime));
    assert.equal(dateFrmt(tcDB.stopTime), dateFrmt(tcAPI.stopTime));
  },
};
