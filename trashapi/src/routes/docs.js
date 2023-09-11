import { join } from 'path';
import { cwd } from 'process';
import { Router } from 'express';

const router = new Router();

const sendFile = file => (_, res) => {
  res.sendFile(join(cwd(), file));
};

router.get('/', sendFile('apidocs/index.html'));

router.get('/swagger.yaml', sendFile('apidocs/swagger.yaml'));

export default router;
