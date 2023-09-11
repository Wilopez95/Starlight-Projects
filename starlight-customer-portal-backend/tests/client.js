import supertest from 'supertest';

import { PORT } from '../config.js';

const ApiRootURL = `http://localhost:${PORT}`;

export const rootClient = supertest(ApiRootURL);
