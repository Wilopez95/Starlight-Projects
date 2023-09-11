import Router from '@koa/router';

import validate from '../../../../middlewares/validate.js';
import { paginateCustomerMedia, sendEmailMedia } from './schema.js';

import {
  createCustomerMedia,
  getCustomerMedia,
  deleteCustomerMedia,
  sendFileInEmail,
} from './controller.js';

const router = new Router();

router.post('/send-email/:id', validate(sendEmailMedia), sendFileInEmail);
router.get('/:customerId', validate(paginateCustomerMedia, 'query'), getCustomerMedia);
router.post('/:customerId', createCustomerMedia);
router.delete('/:id', deleteCustomerMedia);

export default router.routes();
