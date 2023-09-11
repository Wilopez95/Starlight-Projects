import sinon from 'sinon';
import { handleResponseError } from '../request';

describe('request', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should throw error with validation errors on 400 responce', async () => {
    const message = 'Validation error';
    const errors = [{ msg: 'error', param: 'param' }];
    const error = new Error(message);
    error.response = {
      status: 400,
      data: { message, errors },
    };

    try {
      await handleResponseError(error);
      assert.fail();
    } catch (error) {
      expect(error.message).toBe(message);
      expect(error.errors).toEqual(errors);
    }
  });

  it('should throw error on 500 responce', async () => {
    const message = 'Server error';
    const error = new Error(message);
    error.response = {
      status: 500,
      data: { message },
    };

    try {
      await handleResponseError(error);
      assert.fail();
    } catch (error) {
      expect(error.message).toBe(message);
    }
  });

  it('should propagate error on fail request', async () => {
    const error = new Error('Not response error');

    try {
      await handleResponseError(error);
      assert.fail();
    } catch (err) {
      expect(err.message).toBe(error.message);
    }
  });
});
