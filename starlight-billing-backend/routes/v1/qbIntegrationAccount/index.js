import Router from '@koa/router';
import validate from '../../../middlewares/validate.js';
import { getQbIntegrationAccountsList } from './controller.js';
import { integrationId } from './schema.js';

const router = new Router();

router.get('/', validate(integrationId, 'query'), getQbIntegrationAccountsList);

export default router.routes();
