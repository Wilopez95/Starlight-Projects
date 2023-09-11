import getServiceInfo from '../utils/getServiceInfo';

const serviceInfo = getServiceInfo();

export const LOCAL_STORAGE_USER_KEY = serviceInfo
  ? `login-${serviceInfo.platformAccount}:${serviceInfo.service}:${serviceInfo.serviceAccount}`
  : 'login-token';
export const HAULING_FE_HOST = process.env.HAULING_FE_HOST;
export const HAULING_FE_URL = HAULING_FE_HOST ? `https://${HAULING_FE_HOST}` : undefined;
export const LOBBY_URL = `${HAULING_FE_URL}/lobby`;
