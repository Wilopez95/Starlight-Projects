import Router from '@koa/router';

import validate from '../../../../middlewares/validate.js';

import { loginData, emailData } from './schema.js';
import { login, forgotPassword } from './controller.js';

const router = new Router();

router.post('/login', validate(loginData), login);
router.post('/forgot', validate(emailData), forgotPassword);

export default router.routes();
