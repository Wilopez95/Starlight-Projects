import { checkPortalUserProperties } from '../utils/validation.js';

const checkPortalUser = async (ctx, next) => {
  checkPortalUserProperties(ctx.state.user);
  await next();
};

export default checkPortalUser;
