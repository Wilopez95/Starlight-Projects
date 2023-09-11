import R from 'ramda';
import httpStatus from 'http-status';

const asyncWrap =
  f =>
  async (...args) => {
    const [, , next] = args;
    try {
      await f(...args);
    } catch (error) {
      // if the error code is a number, use it, otherwise 500
      const code = error.code ?? error.status;
      const statusCode = R.is(Number, code) ? code : httpStatus.INTERNAL_SERVER_ERROR;
      error.code = statusCode;
      error.status = statusCode;
      next(error);
    }
  };

export default asyncWrap;
