import { LOCAL_STORAGE_USER_KEY } from '../constants';
import { UserInfo } from '../graphql/api';

export function getLocalStorageAuthData(): UserInfo | null {
  const userInfo = localStorage.getItem(LOCAL_STORAGE_USER_KEY);

  if (userInfo) {
    return JSON.parse(userInfo);
  }

  return null;
}
