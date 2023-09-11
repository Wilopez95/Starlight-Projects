import { HttpClient } from '@root/core/api/base';
import { apiConfig } from '@root/core/config';

export const billingHttpClient = new HttpClient(apiConfig.billingApiUrl, 'billing');
