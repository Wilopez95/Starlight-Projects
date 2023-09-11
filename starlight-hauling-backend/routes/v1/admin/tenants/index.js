import Router from '@koa/router';

import validate from '../../../../middlewares/validate.js';
import { authorized } from '../../../../middlewares/authorized.js';
import { PERMISSIONS } from '../../../../consts/permissions.js';
import { tenantData, tenantName } from './schema.js';
import { createTenant, deleteTenant, getTenants, syncTenantToDispatch } from './controller.js';

const router = new Router();

router.get('/', authorized([PERMISSIONS.starlightAdmin]), getTenants);
router.post('/', validate(tenantData), createTenant);
router.delete('/:name', validate(tenantName, 'params'), deleteTenant);

// tech temp endpoint
router.put('/:name', syncTenantToDispatch);

export default router.routes();
