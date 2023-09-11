import { apiConfig } from '../config';
import { HttpClient } from './base';

export const trashapiHttpClient = new HttpClient(apiConfig.apiUrl, 'trashapi');
