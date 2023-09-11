import Router from '@koa/router';

import validate from '../../../../middlewares/validate.js';

import { customersImportParams } from './schema.js';

import { importCustomers, validateExcelData } from './controller.js';

const router = new Router();

router.post('/validate', validate(customersImportParams, 'query'), validateExcelData);
router.post('/', validate(customersImportParams, 'query'), importCustomers);

export default router.routes();
