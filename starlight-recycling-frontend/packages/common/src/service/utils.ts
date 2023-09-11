import { UserInfo } from '../graphql/api';

export function getLocalStorageAuthData(localStorageUserKey: string): UserInfo | null {
  const userInfo = localStorage.getItem(localStorageUserKey);

  if (userInfo) {
    return JSON.parse(userInfo);
  }

  return null;
}

export function redirectForLogin(onLogOut: () => void, redirectUri?: string) {
  const { href } = window.location;
  let redirectTo = redirectUri;

  if (!redirectTo) {
    const savedRedirect = localStorage.getItem('redirectTo');

    if (!savedRedirect) {
      redirectTo = href;
    }
  }

  if (redirectTo) {
    localStorage.setItem('redirectTo', redirectTo);
  }

  onLogOut();
}

interface ControlledPromise<T> extends Promise<T> {
  resolveHard(value: T): void;
}

export const makeControlledPromise = <T>(): ControlledPromise<T> => {
  let resolve: (value: T) => void;
  const p = new Promise<T>((res) => {
    resolve = res;
  });

  return {
    [Symbol.toStringTag]: '[Controlled Promise]',
    resolveHard(value: T) {
      resolve(value);
    },
    then: p.then.bind(p),
    catch: p.catch.bind(p),
    finally: p.finally.bind(p),
  };
};
