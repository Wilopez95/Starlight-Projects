import Router from '@koa/router';

import validate from '../../../../middlewares/validate.js';
import { authorized } from '../../../../middlewares/authorized.js';

import { PERMISSIONS } from '../../../../consts/permissions.js';
import { contactsRecords, contactRecord, contactData, myContactData } from './schema.js';
import {
  getContacts,
  getContactById,
  createContact,
  editContact,
  getMyContact,
  editMyContact,
  deleteContact,
} from './controller.js';

const router = new Router();

router.get('/me', authorized(), getMyContact);
router.put('/me', authorized(), validate(myContactData), editMyContact);
router.get(
  '/',
  authorized([PERMISSIONS.customerPortalContactsList]),
  validate(contactsRecords, 'query'),
  getContacts,
);
router.get(
  '/:id',
  authorized([PERMISSIONS.customerPortalContactsView]),
  validate(contactRecord, 'query'),
  getContactById,
);
router.post(
  '/',
  authorized([PERMISSIONS.customerPortalContactsCreate]),
  validate(contactData),
  createContact,
);
router.put(
  '/:id',
  authorized([PERMISSIONS.customerPortalContactsUpdate]),
  validate(contactData),
  editContact,
);
router.delete('/:id', authorized([PERMISSIONS.customerPortalContactsDelete]), deleteContact);

export default router.routes();
