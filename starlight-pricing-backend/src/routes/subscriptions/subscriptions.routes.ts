import * as Router from 'koa-router';
import { SubscriptionsController } from '../../controllers/subscriptions/subscriptions.controller';
import subscriptionOrdersRoutes from '../../routes/subscriptionOrders/subscriptionOrders.routes';
import { authorized } from '../../middlewares/authorized';
import { validate } from '../../middlewares/validate';
import { processSearchQuery } from '../../middlewares/requestParamsParser';
import {
  createSubscriptionData,
  createSubscriptionDraftData,
  mineOnly,
  queryParams,
  simpleSearchParams,
} from './validate';

const controller = new SubscriptionsController();

const router = new Router();
router.use('/orders', subscriptionOrdersRoutes);
router.get(
  '/by',
  authorized([]),
  //   validate(updateSubscriptionOrder),
  controller.getSubscriptionsBy.bind(controller),
);
router.get('/', authorized([]), controller.getSubscriptionsList.bind(controller));
router.get('/toinvoice', authorized([]), controller.getSubscriptionsListToInvoice.bind(controller));
router.get('/count', authorized([]), controller.getSubscriptionsCount.bind(controller));
router.get('/ending', authorized([]), controller.getEndingSubscriptions.bind(controller));
router.post('/ending/close', authorized([]), controller.closeEndingSubscriptions.bind(controller));

router.post(
  '/',
  // @ts-expect-error it is oks
  authorized([]),
  validate(createSubscriptionData),
  controller.addSubscriptions.bind(controller),
);
router.post(
  '/draft',
  // @ts-expect-error it is oks
  authorized([]),
  validate(createSubscriptionDraftData),
  controller.addSubscriptions.bind(controller),
);
router.put(
  '/:id',
  authorized([]),
  //   validate(updateSubscriptionOrder),
  controller.updateSubscriptions.bind(controller),
);

//router.get("/list", authorized([]), controller.getSubscriptionsList);
router.get(
  '/service-items',
  authorized([]),
  controller.getSubscriptionsServiceItems.bind(controller),
);
router.get(
  '/subscription-paginated',
  // @ts-expect-error it is ok
  authorized([]),
  validate(queryParams, 'query'),
  validate(mineOnly, 'query'),
  controller.getSubscriptionsPaginated.bind(controller),
);

router.get(
  '/AllWithoutEndDate',
  authorized([]),
  controller.getSubscriptionsWithoutEndDate.bind(controller),
);
router.get(
  '/search',
  // @ts-expect-error it is ok
  authorized([]),
  processSearchQuery.bind(null, 'query', true),
  validate(simpleSearchParams, 'query'),
  controller.getSearch.bind(controller),
);
router.get('/:id', authorized([]), controller.getSubscription.bind(controller));
router.get('/draft/:id', authorized([]), controller.getSubscription.bind(controller));
router.delete('/', authorized([]), controller.deleteSubscriptions.bind(controller));
router.get('/:id/details', authorized([]), controller.getSubscription.bind(controller));
router.get('/stream/tenant', authorized([]), controller.streamTenant.bind(controller));

export default router.routes();
