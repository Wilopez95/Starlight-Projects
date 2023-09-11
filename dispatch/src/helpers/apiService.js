import axios from 'axios';
import { getToken } from '@root/helpers/auth';
import { AUTH_API_ENDPOINT } from '@root/helpers/config';

// LEGACY
const authApiService = axios.create({
  baseURL: `${AUTH_API_ENDPOINT}/`,
  timeout: 60000,
  headers: {
    Accept: 'application/json, text/javascript, application/octet-stream, */*; q=0.01',
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  },
});

authApiService.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    Promise.reject(error);
  },
);

export { authApiService };
