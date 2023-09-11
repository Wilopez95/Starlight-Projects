import Router from '@koa/router';

import validate from '../../../middlewares/validate.js';
import { authorized } from '../../../middlewares/authorized.js';

import { PERMISSIONS } from '../../../consts/permissions.js';
import { queryParams, contactData } from './schema.js';
import {
  getContacts,
  getContactById,
  createContact,
  editContact,
  deleteContact,
} from './controller.js';

const router = new Router();

router.get('/', validate(queryParams, 'query'), getContacts);
router.get('/:id', getContactById);
router.post('/', authorized([PERMISSIONS.customersContacts]), validate(contactData), createContact);
router.put('/:id', authorized([PERMISSIONS.customersContacts]), validate(contactData), editContact);
router.delete('/:id', authorized([PERMISSIONS.customersContacts]), deleteContact);

export default router.routes();
