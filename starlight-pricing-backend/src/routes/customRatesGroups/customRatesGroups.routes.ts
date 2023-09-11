import * as Router from 'koa-router';
import { CustomRatesGroupsController } from '../../controllers/customRatesGroups/customRatesGroups.controller';
import { authorized } from '../../middlewares/authorized';
import { validate } from '../../middlewares/validate';
import { createCustomRatesGroupsSchema, updateCustomRatesGroupsSchema } from './validate';
const controller = new CustomRatesGroupsController();

const router = new Router();

router.get('/custom', authorized([]), controller.getCustomRatesGroups.bind(controller));
router.get('/custom/:id', authorized([]), controller.getCustomRatesGroupBy.bind(controller));
router.post(
  '/custom',
  // @ts-expect-error it is ok
  authorized([]),
  validate(createCustomRatesGroupsSchema),
  controller.addCustomRatesGroups.bind(controller),
);
router.put(
  '/:id',
  // @ts-expect-error it is ok
  authorized([]),
  validate(updateCustomRatesGroupsSchema),
  controller.updateCustomRatesGroups.bind(controller),
);
router.post(
  '/:id/duplicate',
  // @ts-expect-error it is ok
  authorized([]),
  validate(createCustomRatesGroupsSchema),
  controller.duplicateCustomRatesGroups.bind(controller),
);

export default router.routes();
