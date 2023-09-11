import Router from '@koa/router';

import validate from '../../../middlewares/validate.js';
import {
  createReminderSchema,
  editReminderSchema,
  editUserReminderSchema,
  getReminderSchema,
  getUserRemindersSchema,
} from './schema.js';
import {
  getReminder,
  createReminder,
  editReminder,
  deleteReminder,
  getUserReminders,
  editUserReminder,
  deleteAllUserReminders,
  deleteUserReminder,
} from './controller.js';

const router = new Router();

// user specific in app reminders
router.get('/user', validate(getUserRemindersSchema, 'query'), getUserReminders);
router.put('/user/:id', validate(editUserReminderSchema), editUserReminder);
router.delete('/user', deleteAllUserReminders);
router.delete('/user/:id', deleteUserReminder);

router.get('/', validate(getReminderSchema, 'query'), getReminder);
router.post('/', validate(createReminderSchema), createReminder);
router.put('/:id', validate(editReminderSchema), editReminder);
router.delete('/:id', deleteReminder);

export default router.routes();
