import Router from '@koa/router';

import validate from '../../../middlewares/validate.js';

import { customerData, ccData, jobSiteData, orderRequestData } from './schema.js';

import {
  testIntegration,
  confirmIntegration,
  cancelIntegration,
  getMaterialsWithMappedEquipments,
  getServiceAreas,
  getRates,
  createCustomer,
  editCustomer,
  addCreditCard,
  getCreditCards,
  createJobSite,
  createOrderRequest,
  fetchOrderRequests,
} from './controller.js';

const router = new Router();

router.head('/integration/test', testIntegration);
router.head('/integration/confirm', confirmIntegration);
router.head('/integration/cancel', cancelIntegration);
router.get('/materials-w-dumpsters', getMaterialsWithMappedEquipments);
router.get('/service-areas', getServiceAreas);
router.get('/rates', getRates);
router.post('/customer', validate(customerData), createCustomer);
router.patch('/customer/:id', validate(customerData), editCustomer);
router.post('/customer/:customerId/credit-cards', validate(ccData), addCreditCard);
router.get('/customer/:customerId/credit-cards', getCreditCards);
router.post('/job-site', validate(jobSiteData), createJobSite);
router.post('/order-request', validate(orderRequestData), createOrderRequest);
router.post('/order-requests/fetch', fetchOrderRequests);

export default router.routes();
