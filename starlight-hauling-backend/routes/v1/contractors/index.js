import Router from '@koa/router';

import validate from '../../../middlewares/validate.js';

import {
  activeOnly,
  contactParams,
  profileData,
  newCreditCard,
  updateCreditCard,
  newJobSite,
  editJobSite,
  jobSiteId,
  paginated,
  canTypeId,
  priceParams,
  createOrder,
  orderRequestId,
  historical,
  downloadSchema,
  newMessageData,
  getChatMessagesParams,
} from './schema.js';
import {
  getCompanyInfo,
  getCustomerContacts,
  updateProfile,
  getCustomerCreditCards,
  addCustomerCreditCard,
  updateCustomerCreditCard,
  createJobSite,
  updateJobSite,
  getJobSiteById,
  getJobSites,
  getMaterials,
  getBillableServices,
  getPriceInfo,
  createOrderRequest,
  getSalesOrderById,
  getOrderRequests,
  getSalesOrders,
  updateOrderRequest,
  removeOrderRequest,
  getNotifications,
  proxyDownloadFromBilling,
  createMessage,
  getChatMessages,
} from './controller.js';

const router = new Router();

router.get('/getcompanyinfo', getCompanyInfo);
router.get(
  '/getcontacts',
  validate(contactParams, 'query'),
  validate(activeOnly, 'query'),
  getCustomerContacts,
);

router.post('/updateprofile', validate(profileData), updateProfile);

router.get('/getcards', validate(activeOnly, 'query'), getCustomerCreditCards);
router.post('/createcard', validate(newCreditCard), addCustomerCreditCard);
router.post('/updatecard', validate(updateCreditCard), updateCustomerCreditCard);

router.post('/createjobsite', validate(newJobSite), createJobSite);
router.post('/updateJobSite', validate(editJobSite), updateJobSite);
router.get('/getjobsite', validate(jobSiteId, 'query'), getJobSiteById);
router.get('/getjobsites', validate(paginated, 'query'), getJobSites);

router.get('/getmaterialtypes', validate(activeOnly, 'query'), getMaterials);
router.get(
  '/getservicetypes',
  validate(activeOnly, 'query'),
  validate(canTypeId, 'query'),
  getBillableServices,
);

router.get('/getPriceInfo', validate(priceParams, 'query'), getPriceInfo);

router.post('/createorder', validate(createOrder), createOrderRequest);
router.get(
  '/getorders',
  validate(jobSiteId, 'query'),
  validate(paginated, 'query'),
  getOrderRequests,
);

router.get('/getsalesorder/:id', getSalesOrderById);
router.get(
  '/getsalesorders',
  validate(jobSiteId, 'query'),
  validate(paginated, 'query'),
  validate(historical, 'query'),
  getSalesOrders,
);

router.post('/updateorder', validate(createOrder), validate(orderRequestId), updateOrderRequest);
router.post('/cancelOrder', validate(orderRequestId), removeOrderRequest);

router.get('/getNotifications', getNotifications);

router.post('/materials-report', validate(downloadSchema), proxyDownloadFromBilling);

router.post('/createMessage', validate(newMessageData), createMessage);
router.get('/getMessages', validate(getChatMessagesParams, 'query'), getChatMessages);

export default router.routes();
