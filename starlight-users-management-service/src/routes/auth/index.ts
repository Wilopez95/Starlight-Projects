import Router from '@koa/router';

import { AppState, Context } from '../../context';
import { userInfoMiddleware } from '../../middleware/userInfo';
import { serviceTokenMiddleware } from '../../middleware/serviceToken';
import {
  initiateLogin,
  loginCallback,
  initiateLogout,
  refresh,
  performLogin,
  performLogout,
  logoutCallback,
  exchangeUmsCodeForToken,
} from './controllers';

const authRouter = new Router<AppState, Context>();

authRouter.post('/login', serviceTokenMiddleware, initiateLogin);
authRouter.get('performLogin', '/perform-login', performLogin);
authRouter.get('loginCallback', '/logincb', loginCallback);

// must use user access token
authRouter.post('/logout', userInfoMiddleware, initiateLogout);

authRouter.get('performLogout', '/perform-logout', performLogout);
authRouter.get('logoutCallback', '/logoutcb', logoutCallback);

authRouter.post('/refresh', refresh);
authRouter.post('/token', serviceTokenMiddleware, exchangeUmsCodeForToken);

export default authRouter;
