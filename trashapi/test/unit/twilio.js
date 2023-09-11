/* global describe, it */
import assert from 'assert';
import proxyquire from 'proxyquire';

import {
  buildSMSMessage,
  buildSMSMessageWithoutCan,
  buildTimeMessage,
} from '../../src/routes/workorders/transitions.js';

const makeFakeTwilio = error => {
  const sendMessage = error => (data, callback) => {
    return error ? callback(error) : callback(null, data);
  };
  const twilio = () => ({ sendMessage: sendMessage(error) });

  const { sendSMS } = proxyquire('../../src/utils/twilio', { twilio });
  return { sendSMS };
};

describe('test twilio ', () => {
  it('twilio', async () => {
    const { sendSMS } = makeFakeTwilio();
    const to = 1;
    const from = 2;
    const body = 3;
    const data = await sendSMS(to, body, from);

    assert.deepEqual(data, { to, from, body });
  });

  it('twilio error ', async () => {
    const someError = new Error('some error');
    const { sendSMS } = makeFakeTwilio(someError);
    const to = 1;
    const from = 2;
    const body = 3;
    try {
      await sendSMS(to, body, from);
    } catch (err) {
      assert.deepEqual(err, someError);
    }
  });

  it('API-252 - check  buildSMSMessage description ', async () => {
    const size = '12';
    const action = 'SPOT';
    const material = 'C & D';
    const locName = 'testLocation';
    const time = '1h';
    const timeMessage = await buildTimeMessage(time);
    const actualMessage = await buildSMSMessage(
      size,
      action,
      material,
      locName,
      timeMessage,
    );
    const expectedMessage =
      `*** DO NOT REPLY ***\nHello.\nWe are in route to perform a ` +
      `${size} YD ${action} of ${material} at ${locName}.${timeMessage}\nStarlight`;

    assert.deepEqual(expectedMessage, actualMessage);
  });

  it('API-252 - check  buildSMSMessageWithoutCan description ', async () => {
    const action = 'SPOT';
    const locName = 'testLocation';
    const time = '1h';
    const timeMessage = await buildTimeMessage(time);
    const actualMessage = await buildSMSMessageWithoutCan(
      action,
      locName,
      timeMessage,
    );
    const expectedMessage =
      `*** DO NOT REPLY ***\nHello.\nWe are in route to perform a ` +
      `${action} at ${locName}.${timeMessage}\nStarlight`;

    assert.deepEqual(expectedMessage, actualMessage);
  });
});
