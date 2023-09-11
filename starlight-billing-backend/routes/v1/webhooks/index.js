import Router from '@koa/router';

// TODO: figure out with SendGrid support why this is not working
// import { verifySendGridSignature } from '../../../middlewares/sendGridSignature.js';

import { emailsWebhook } from './controller.js';

const webhooksRouter = new Router();

webhooksRouter.post('/emails', emailsWebhook);

export default webhooksRouter.routes();
