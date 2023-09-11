import Router from '@koa/router';

import validate from '../../../middlewares/validate.js';
import { addCcData, filterCc } from './schema.js';
import {
  getCustomer,
  getAvailableCredit,
  getCustomerCreditCards,
  addCustomerCreditCard,
  updateCustomerCreditCard,
  updateCustomerCreditCardAutoPay,
} from './controller.js';

const router = new Router();

router.get('/available-credit', getAvailableCredit);

router.get('/credit-cards', validate(filterCc, 'query'), getCustomerCreditCards);
router.post('/credit-cards', validate(addCcData), addCustomerCreditCard);
router.patch('/credit-cards/:id', updateCustomerCreditCard);
router.patch('/credit-cards/auto-pay/:id', updateCustomerCreditCardAutoPay);
router.get('/', getCustomer);

export default router.routes();
