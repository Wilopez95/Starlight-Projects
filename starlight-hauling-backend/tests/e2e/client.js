import supertest from 'supertest';

import { PORT, API_PATH, API_V2_PATH } from '../../config.js';

export const baseURLv1 = `http://localhost:${PORT}${API_PATH}/`;
export const clientV1 = supertest(baseURLv1);
export const baseURLv2 = `http://localhost:${PORT}${API_V2_PATH}/`;
export const clientV2 = supertest(baseURLv2);

export default clientV1;
