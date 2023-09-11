/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-misused-promises */
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';

import * as React from 'react';
import { useLocation, useRouteMatch } from 'react-router-dom';
import { Params, Routes } from '@root/routes/routing';
import {
  ICurrentUser,
  IUserContext,
  UserTokens,
} from '@root/auth/types/currentUser';
import {
  GraphqlRequestOptions,
  RequestOptions,
  trashapiHttpClient,
} from '@root/auth/api/base';
import { request as requestAxios } from '@root/helpers';
import { AuthService } from '../../auth/api/auth';
import { makeControlledPromise } from '../../auth/helpers';
import { ApiError } from '../../auth/api/ApiError';

const noop = () => Promise.resolve();

const getResourceApiPath = (
  tenantName: string | undefined,
  businessUnit: string | undefined,
) => {
  const currentPathname = location.pathname;

  if (
    businessUnit &&
    tenantName &&
    currentPathname.includes(`/${Routes.BusinessUnits}/`)
  ) {
    return `${tenantName}/${Routes.BusinessUnits}/${businessUnit}`;
  }

  if (tenantName && currentPathname.includes(`/${Routes.Configuration}`)) {
    return `${tenantName}/${Routes.Configuration}`;
  }

  return `${Routes.Lobby}`;
};

export const getLocalStorageUserKey = (resourcePath: string) => {
  return `user-login:${resourcePath}`;
};

export const UserContext = createContext<IUserContext>({
  isLoading: true,
  logOut: noop,
  setError: noop,
  setUserTokens: noop,
});

export const hasUserTokensForResource = (resourcePath: string) => {
  const userInfoStr = localStorage.getItem(
    getLocalStorageUserKey(resourcePath),
  );

  if (userInfoStr) {
    const userInfo = JSON.parse(userInfoStr) as StoredUserInfo;
    const now = new Date();
    const expiresAt = userInfo.tokens?.expiresAt
      ? new Date(userInfo.tokens.expiresAt)
      : now;
    const refreshExpiresAt = userInfo.tokens?.refreshExpiresAt
      ? new Date(userInfo.tokens.refreshExpiresAt)
      : now;

    if (expiresAt > now) {
      return true;
    }

    if (refreshExpiresAt > now) {
      return true;
    }

    localStorage.removeItem(getLocalStorageUserKey(resourcePath));
  }

  return false;
};

const getResourcePath = (businessUnit: string | undefined): string => {
  const currentPathname = location.pathname;

  if (businessUnit && currentPathname.includes(`/${Routes.BusinessUnits}/`)) {
    return `${Routes.BusinessUnits}/${businessUnit}`;
  }

  if (currentPathname.includes(`/${Routes.Configuration}`)) {
    return `${Routes.Configuration}`;
  }

  return `${Routes.Lobby}`;
};

export const getInitialUserInfo = (key: string) =>
  JSON.parse(localStorage.getItem(key) ?? 'null') as StoredUserInfo | null;

interface StoredUserInfo {
  tokens?: UserTokens;
  me?: ICurrentUser;
}
type Props = {
  children?: React.ReactNode;
};
const UserProvider: React.FC<Props> = ({ children }) => {
  const location = useLocation();
  const businessUnitPathMatch = useRouteMatch<{ businessUnit: string }>(
    `/${Routes.BusinessUnits}/${Params.businessUnit}`,
  );
  const businessUnitPathMatchLogin = useRouteMatch<{
    businessUnit: string;
    tenantName: string;
  }>(`/${Params.tenantName}/${Routes.BusinessUnits}/${Params.businessUnit}`);
  const authService = useRef<AuthService>(new AuthService());
  const [isLoading, setIsLoading] = useState(true);
  const [isReadyToSendRequests, setIsReadyToSendRequests] = useState(false);
  let businessUnit = businessUnitPathMatch?.params.businessUnit;

  if (
    !businessUnit &&
    businessUnitPathMatchLogin?.params.tenantName !== Routes.Configuration
  ) {
    businessUnit = businessUnitPathMatchLogin?.params.businessUnit;
  }

  const [error, setError] = useState<string | undefined>();
  const lastStorageKey = useRef<string>(
    getLocalStorageUserKey(getResourcePath(businessUnit)),
  );
  const currentUserInfo = useRef<StoredUserInfo | null>(
    getInitialUserInfo(lastStorageKey.current),
  );
  const [forcedRefresh, forceRefreshUserInfo] = useReducer(
    (i: number) => i + 1,
    0,
  );
  const storeUserInfo = useCallback(
    (userInfo: StoredUserInfo) => {
      const resourcePath = getResourcePath(businessUnit);

      currentUserInfo.current = userInfo;

      const storageKey = getLocalStorageUserKey(resourcePath);

      localStorage.setItem(storageKey, JSON.stringify(userInfo));
      lastStorageKey.current = storageKey;
    },
    [businessUnit],
  );

  const clearTokens = useCallback(() => {
    const storedUserInfo = currentUserInfo.current;

    storeUserInfo({
      me: storedUserInfo?.me,
      tokens: undefined,
    });
    forceRefreshUserInfo();

    setIsLoading(true);
  }, [storeUserInfo]);

  useEffect(() => {
    const { tokens } = currentUserInfo.current ?? {};
    if (tokens?.token) {
      requestAxios.interceptors.request.use(
        (config: any) => {
          config.headers.Authorization = `Bearer ${tokens.token}`;

          return config;
        },
        (err: unknown) => {
          Promise.reject(err);
        },
      );
    }
  }, [currentUserInfo]);

  // Change current user token when we navigate to a different resource.
  useEffect(() => {
    const resourcePath = getResourcePath(businessUnit);
    const storageKey = getLocalStorageUserKey(resourcePath);

    if (storageKey === lastStorageKey.current) {
      return;
    }

    lastStorageKey.current = storageKey;

    const userInfo = localStorage.getItem(storageKey);

    if (userInfo) {
      currentUserInfo.current = JSON.parse(userInfo) as StoredUserInfo;
    } else {
      currentUserInfo.current = null;
    }

    forceRefreshUserInfo();
  }, [location.pathname, businessUnit]);

  // Register http middlewares and mark app ready to render.
  useEffect(() => {
    let tryRefreshTokenPromise: Promise<UserTokens | null> | null = null;
    let tokensUpdatedPromise: Promise<void> | null = null;

    const tryRefreshToken = (): Promise<UserTokens | null> => {
      const storedUserInfo = currentUserInfo.current;
      const currentUser = storedUserInfo?.me;
      const userTokens = storedUserInfo?.tokens;

      if (tryRefreshTokenPromise) {
        return tryRefreshTokenPromise;
      }

      if (!userTokens) {
        return Promise.resolve(null);
      }

      const resourcePath = getResourceApiPath(
        currentUser?.tenantName,
        businessUnit,
      );
      const p = authService.current.tryRefreshToken(
        resourcePath,
        userTokens.refreshToken,
      );

      tryRefreshTokenPromise = p;

      p.then(() => {
        tryRefreshTokenPromise = null;
      });

      return p;
    };

    const unauthenticatedErrorMiddleware = async (
      request: RequestOptions<unknown> | GraphqlRequestOptions,
      next: () => Promise<unknown>,
    ) => {
      const { me: currentUser, tokens: userTokens } =
        currentUserInfo.current ?? {};

      try {
        if (tokensUpdatedPromise !== null) {
          await tokensUpdatedPromise;
        }

        return await next();
      } catch (err: unknown) {
        if ((err as ApiError).statusCode !== 401) {
          throw err;
        }

        if (authService.current.shouldClearTokens()) {
          clearTokens();

          return;
        }

        if (!userTokens) {
          authService.current.goToLogin(
            getResourceApiPath(currentUser?.tenantName, businessUnit),
          );

          return;
        }

        const p = makeControlledPromise<void>();

        tokensUpdatedPromise = p;

        const newTokens = await tryRefreshToken();

        // if no tokens and it is not login page
        if (!newTokens) {
          authService.current.goToLogin(
            getResourceApiPath(currentUser?.tenantName, businessUnit),
          );

          return;
        }

        storeUserInfo({
          me: currentUser,
          tokens: newTokens,
        });
        forceRefreshUserInfo();
        p.resolveWith();

        request.headers = {
          ...request.headers,
          authorization: `Bearer ${newTokens.token}`,
        };

        // Retry previous request.
        const response = await next();

        return response;
      }
    };

    const accessTokenMiddleware = (
      request: RequestOptions<unknown> | GraphqlRequestOptions,
      next: () => Promise<unknown>,
    ) => {
      const { tokens } = currentUserInfo.current ?? {};

      if (tokens?.token) {
        request.headers = {
          ...request.headers,
          authorization: `Bearer ${tokens.token}`,
        };
      }
      return next();
    };

    trashapiHttpClient.registerMiddleware(accessTokenMiddleware);

    trashapiHttpClient.registerMiddleware(unauthenticatedErrorMiddleware);

    setIsReadyToSendRequests(true);

    return () => {
      setIsReadyToSendRequests(false);

      trashapiHttpClient.unregisterMiddleware(accessTokenMiddleware);

      trashapiHttpClient.unregisterMiddleware(unauthenticatedErrorMiddleware);
    };
  }, [clearTokens, storeUserInfo, businessUnit]);

  useEffect(() => {
    if (!isReadyToSendRequests) {
      return;
    }
    const { tokens } = currentUserInfo.current ?? {};

    let canceled = false;

    if (tokens) {
      void (async () => {
        if (canceled) {
          return;
        }

        const [currentUser] = await Promise.all([
          AuthService.currentUser(tokens.token),
        ]);
        if (canceled) {
          return;
        }

        if (currentUser) {
          const me = { ...currentUser };
          storeUserInfo({
            me,
            tokens,
          });
        }

        setIsLoading(false);
      })();
    } else {
      setIsLoading(false);
    }

    return () => {
      canceled = true;
    };
  }, [forcedRefresh, isReadyToSendRequests, storeUserInfo]);

  const userContext = useMemo<IUserContext>(() => {
    // This is necessary to introduce an artificial dependency on this property.
    // TODO: Find a less hackish way via MobX or something.
    forcedRefresh;

    return {
      isLoading,
      error,
      currentUser: currentUserInfo.current?.me
        ? {
            ...currentUserInfo.current.me,
            permissions: new Set(currentUserInfo.current.me.permissions),
          }
        : undefined,
      userTokens: currentUserInfo.current?.tokens,
      setUserTokens: (tokens: UserTokens) => {
        setIsLoading(true);

        storeUserInfo({
          me: currentUserInfo.current?.me,
          tokens,
        });
        forceRefreshUserInfo();
      },
      setCompany: () => {
        const currentUser = currentUserInfo.current?.me;

        if (!currentUser) {
          return;
        }

        storeUserInfo({
          ...currentUserInfo.current,
          me: {
            ...currentUser,
          },
        });
        forceRefreshUserInfo();
      },
      setError,
      logOut: () => {
        const tenantName = currentUserInfo.current?.me?.tenantName;
        const token = currentUserInfo.current?.tokens?.token ?? '';
        authService.current.logOut(
          getResourceApiPath(tenantName, businessUnit),
          token,
        );
      },
    };
  }, [forcedRefresh, isLoading, error, businessUnit, storeUserInfo]);

  if (!isReadyToSendRequests) {
    return null;
  }
  return (
    <UserContext.Provider value={userContext}>{children}</UserContext.Provider>
  );
};

export default UserProvider;
