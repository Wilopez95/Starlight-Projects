import Router from '@koa/router';

import validate from '../../../middlewares/validate.js';

import { queryParams, customerParam, pagination, mostRecentParam, projectData } from './schema.js';
import {
  getProjects,
  getCustomerProjects,
  getAllProjects,
  getProjectsCount,
  getProjectById,
  createProject,
  editProject,
  deleteProject,
} from './controller.js';

const router = new Router();

router.get('/count', validate(queryParams, 'query'), getProjectsCount);
router.get('/all', validate(queryParams, 'query'), getAllProjects);
router.get(
  '/customer',
  validate(customerParam, 'query'),
  validate(pagination, 'query'),
  validate(mostRecentParam, 'query'),
  getCustomerProjects,
);
router.get(
  '/',
  validate(queryParams, 'query'),
  validate(pagination, 'query'),
  validate(mostRecentParam, 'query'),
  getProjects,
);

router.get('/:id', getProjectById);
router.post('/', validate(projectData), createProject);
router.put('/:id', validate(projectData), editProject);
router.delete('/:id', deleteProject);

export default router.routes();
