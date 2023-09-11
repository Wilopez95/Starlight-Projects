import Router from '@koa/router';

import validate from '../../../../../middlewares/validate.js';

import { commentData } from './schema.js';
import { getComments, createComment, editComment, deleteComment } from './controller.js';

const router = new Router();

router.get('/', getComments);
router.post('/', validate(commentData), createComment);
router.patch('/:id', validate(commentData), editComment);
router.delete('/:id', deleteComment);

export default router.routes();
