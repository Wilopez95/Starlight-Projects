import Router from '@koa/router';

import syncRoutes from '../sync/index.js';
import { authorized } from '../../../middlewares/authorized.js';
import { PERMISSIONS } from '../../../consts/permissions.js';
import cacheRoutes from './cache/index.js';
import searchIndexRoutes from './search/index.js';
import tenantRoutes from './tenants/index.js';

const router = new Router();

router.use('/cache', authorized([PERMISSIONS.starlightAdmin]), cacheRoutes);
router.use('/search', authorized([PERMISSIONS.starlightAdmin]), searchIndexRoutes);
router.use('/tenants', tenantRoutes);
router.use('/sync', authorized([PERMISSIONS.starlightAdmin]), syncRoutes);

export default router.routes();
