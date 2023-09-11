import Router from '@koa/router';

import ACTIONS from '../../../consts/actions.js';
import validate from '../../../middlewares/validate.js';
import { authorizedMiddleware as authorized } from '../../../auth/authorized.js';
import idType from '../../../consts/idType.js';

import {
  getContacts,
  getContactById,
  createContact,
  editContact,
  getMyContact,
  editMyContact,
  deleteContact,
} from './controller.js';
import { myContactData, contactsRecords, contactData, contactRecord } from './schema.js';

const {
  contacts: { view, list, create, update, del },
} = ACTIONS;
const router = new Router();

router.get('/me', authorized(), getMyContact);
router.put('/me', authorized(), validate(myContactData), editMyContact);

router.get('/', authorized([list]), validate(contactsRecords, 'query'), getContacts);
router.post('/', authorized([create]), validate(contactData), createContact);

router.get(
  '/:id',
  authorized([view]),
  validate(idType, 'params'),
  validate(contactRecord, 'query'),
  getContactById,
);
router.put(
  '/:id',
  authorized([update]),
  validate(idType, 'params'),
  validate(contactData),
  editContact,
);
router.delete('/:id', authorized([del]), validate(idType, 'params'), deleteContact);

export default router.routes();
