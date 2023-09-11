import Router from '@koa/router';

import { skipBodyLogging } from '../../../middlewares/logger.js';
import validate from '../../../middlewares/validate.js';
import {
  createConfiguration,
  updateConfiguration,
  configurationParams,
  integrationId,
} from './schema.js';
import {
  getQBConfigurationsList,
  createQBConfiguration,
  updateQBConfiguration,
  deleteQBConfiguration,
  generateQWCSettingsFile,
  exportExcelFile,
  parseExcelFile,
} from './controller.js';

const router = new Router();

router.get('/', getQBConfigurationsList);
router.post('/', validate(createConfiguration), createQBConfiguration);
router.put('/:id', validate(updateConfiguration), updateQBConfiguration);
router.get('/qwc-file', validate(configurationParams, 'query'), generateQWCSettingsFile);
router.get('/excel-file', skipBodyLogging, validate(integrationId, 'query'),  exportExcelFile);
router.post('/parse-excel-file', validate(integrationId, 'query'),  parseExcelFile);
router.post('/delete/:id', validate(configurationParams, 'params'), deleteQBConfiguration);

export default router.routes();
