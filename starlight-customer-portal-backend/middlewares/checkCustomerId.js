import ApplicationError from '../errors/ApplicationError.js';

const checkCustomerId = async (ctx, next) => {
  const requestedId = ctx.params.id;
  const { customerId } = ctx.state.user;
  const isSame = parseInt(requestedId, 10) === parseInt(customerId, 10);

  if (!requestedId || !customerId || !isSame) {
    throw ApplicationError.accessDenied();
  }
  await next();
};

export default checkCustomerId;
