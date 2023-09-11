import Router from '@koa/router';
import validate from '../../../../middlewares/validate.js';

import { jobSitesImportParams } from './schema.js';

import { validateExcelData, importJobSites } from './controller.js';

const router = new Router();

router.post('/validate', validate(jobSitesImportParams, 'query'), validateExcelData);
router.post('/', validate(jobSitesImportParams, 'query'), importJobSites);

export default router.routes();
