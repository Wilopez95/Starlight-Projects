import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useRouteMatch } from 'react-router-dom';

import { AuthService, ClockInOutService, CompanyService } from '@root/api';
import {
  GraphqlRequestOptions,
  haulingHttpClient,
  RequestOptions,
  routePlannerHttpClient,
  umsHttpClient,
} from '@root/api/base';
import { ApiError } from '@root/api/base/ApiError';
import { IClockInOut } from '@root/api/clockInOut/types';
import { Params, Routes } from '@root/consts';
import { convertDates } from '@root/helpers';
import { type ICurrentUser, type UserTokens } from '@root/types';

interface IUserContext {
  showClockIn: boolean;
  currentUser?: ICurrentUser;
  currentClockInOut?: IClockInOut;
  error?: string;
  userTokens?: UserTokens;
  isLoading: boolean;
  logOut(): void;
  setError(error?: string): void;
  clockOut(cleanOnly?: boolean): Promise<void>;
  clockIn(): Promise<void>;
  setUserTokens(tokens: UserTokens): void;
  hasUserTokensForResource(resourcePath: string): boolean;
}

const noop = () => Promise.resolve();

const hashLogoUrl = (url: string | null) => {
  if (!url) {
    return null;
  }

  if (url.startsWith('data:')) {
    return url;
  }

  return url.concat(`?${new Date().getTime()}`);
};

const getLocalStorageUserKey = (resourcePath: string) => {
  return `user-login:${resourcePath}`;
};

export const UserContext = createContext<IUserContext>({
  showClockIn: false,
  isLoading: true,
  logOut: noop,
  clockOut: noop,
  clockIn: noop,
  setError: noop,
  setUserTokens: noop,
  hasUserTokensForResource: () => false,
});

interface StoredUserInfo {
  tokens?: UserTokens;
  me?: ICurrentUser;
}

const UserProvider: React.FC = ({ children }) => {
  const location = useLocation();
  const businessUnitPathMatch = useRouteMatch<{ businessUnit: string }>(
    `/${Routes.BusinessUnits}/${Params.businessUnit}`,
  );
  const businessUnitPathMatchLogin = useRouteMatch<{ businessUnit: string }>(
    `/${Params.tenantName}/${Routes.BusinessUnits}/${Params.businessUnit}`,
  );
  const authService = useRef<AuthService>(new AuthService());
  const [isLoading, setIsLoading] = useState(true);
  const [isReadyToSendRequests, setIsReadyToSendRequests] = useState(false);
  const businessUnit = useMemo(
    () =>
      businessUnitPathMatch?.params.businessUnit ?? businessUnitPathMatchLogin?.params.businessUnit,
    [businessUnitPathMatch, businessUnitPathMatchLogin],
  );
  const [error, setError] = useState<string | undefined>();
  const [showClockIn, setShowClockIn] = useState(false);
  const [currentClockInOut, setCurrentClockInOut] = useState<IClockInOut | undefined>();

  const getResourcePath = useCallback((): string => {
    const currentPathname = location.pathname;

    if (currentPathname.startsWith(`/${Routes.Configuration}`)) {
      return `${Routes.Configuration}`;
    }

    if (businessUnit && currentPathname.includes(`/${Routes.BusinessUnits}/`)) {
      return `${Routes.BusinessUnits}/${businessUnit}`;
    }

    return `${Routes.Lobby}`;
  }, [businessUnit, location.pathname]);

  const getStoredUserInfo = useCallback(() => {
    const resourcePath = getResourcePath();
    const userInfo = localStorage.getItem(getLocalStorageUserKey(resourcePath));

    if (userInfo) {
      return JSON.parse(userInfo) as StoredUserInfo;
    }

    return undefined;
  }, [getResourcePath]);

  const storedUserInfo = useMemo(() => getStoredUserInfo(), [getStoredUserInfo]);

  const [currentUser, setCurrentUser] = useState<ICurrentUser | undefined>(storedUserInfo?.me);
  const [userTokens, setUserTokens] = useState<UserTokens | undefined>(storedUserInfo?.tokens);

  const getResourceApiPath = useCallback(() => {
    const currentPathname = location.pathname;
    const tenantName = currentUser?.tenantName;

    if (currentPathname.startsWith(`/${Routes.Configuration}`)) {
      return `${Routes.Configuration}`;
    }

    if (businessUnit && tenantName && currentPathname.includes(`/${Routes.BusinessUnits}/`)) {
      return `${tenantName}/${Routes.BusinessUnits}/${businessUnit}`;
    }

    return `${Routes.Lobby}`;
  }, [currentUser, businessUnit, location.pathname]);

  const clearStoredUserInfo = useCallback(() => {
    const resourcePath = getResourcePath();

    setCurrentUser(undefined);
    setUserTokens(undefined);

    localStorage.removeItem(getLocalStorageUserKey(resourcePath));
  }, [setCurrentUser, setUserTokens, getResourcePath]);

  const storeUserInfo = useCallback(
    (userInfo: StoredUserInfo) => {
      const resourcePath = getResourcePath();

      setCurrentUser(userInfo.me);
      setUserTokens(userInfo.tokens);

      localStorage.setItem(getLocalStorageUserKey(resourcePath), JSON.stringify(userInfo));
    },
    [setCurrentUser, setUserTokens, getResourcePath],
  );

  const clearSession = useCallback(() => {
    clearStoredUserInfo();
  }, [clearStoredUserInfo]);

  const clearTokens = useCallback(() => {
    storeUserInfo({
      me: currentUser,
      tokens: undefined,
    });
    setIsLoading(true);
  }, [currentUser, storeUserInfo]);

  useEffect(() => {
    let tryRefreshTokenPromise: Promise<UserTokens | null> | null = null;
    const tryRefreshToken = (): Promise<UserTokens | null> => {
      if (tryRefreshTokenPromise) {
        return tryRefreshTokenPromise;
      }

      if (!userTokens) {
        return Promise.resolve(null);
      }

      const resourcePath = getResourceApiPath();
      const p = authService.current.tryRefreshToken(resourcePath, userTokens.refreshToken);

      tryRefreshTokenPromise = p;

      p.then(tokens => {
        storeUserInfo({
          me: currentUser,
          tokens: tokens ?? undefined,
        });

        tryRefreshTokenPromise = null;
      });

      return p;
    };

    const unauthenticatedErrorMiddleware = async (
      _request: RequestOptions<unknown> | GraphqlRequestOptions,
      next: () => Promise<unknown>,
    ) => {
      try {
        const response = await next();

        return response;
      } catch (err) {
        if ((err as ApiError).statusCode === 401) {
          if (location.pathname.includes('/login')) {
            clearTokens();

            return;
          }

          if (!userTokens) {
            authService.current.goToLogin(getResourceApiPath());

            return;
          }

          const tokens = await tryRefreshToken();

          if (tokens) {
            storeUserInfo({
              me: currentUser,
              tokens,
            });
            // retry request
            const response = await next();
            return response;
          } else {
            // if no tokens and it is not login page
            authService.current.goToLogin(getResourceApiPath());
            return;
          }
        }

        throw err;
      }
    };

    const accessTokenMiddleware = (
      request: RequestOptions<unknown> | GraphqlRequestOptions,
      next: () => Promise<unknown>,
    ) => {
      if (userTokens?.token) {
        request.headers = Object.assign(request.headers ?? {}, {
          Authorization: `Bearer ${userTokens.token}`,
        });

        return next();
      }

      return next();
    };

    haulingHttpClient.registerMiddleware(accessTokenMiddleware);
    routePlannerHttpClient.registerMiddleware(accessTokenMiddleware);
    umsHttpClient.registerMiddleware(accessTokenMiddleware);

    haulingHttpClient.registerMiddleware(unauthenticatedErrorMiddleware);
    routePlannerHttpClient.registerMiddleware(unauthenticatedErrorMiddleware);
    umsHttpClient.registerMiddleware(unauthenticatedErrorMiddleware);

    setIsReadyToSendRequests(true);

    return () => {
      setIsReadyToSendRequests(false);

      haulingHttpClient.unregisterMiddleware(accessTokenMiddleware);
      routePlannerHttpClient.unregisterMiddleware(accessTokenMiddleware);
      umsHttpClient.unregisterMiddleware(accessTokenMiddleware);
      haulingHttpClient.unregisterMiddleware(unauthenticatedErrorMiddleware);
      routePlannerHttpClient.unregisterMiddleware(unauthenticatedErrorMiddleware);
      umsHttpClient.unregisterMiddleware(unauthenticatedErrorMiddleware);
    };
  }, [
    clearSession,
    clearTokens,
    currentUser,
    getResourceApiPath,
    getResourcePath,
    storeUserInfo,
    userTokens,
    location.pathname,
    isLoading,
    getStoredUserInfo,
  ]);

  useEffect(() => {
    if (userTokens) {
      (async () => {
        const [currentUserData, currentCompany, currentClockIn] = await Promise.all([
          AuthService.currentUser(userTokens.token),
          CompanyService.getCurrentCompany(),
          ClockInOutService.getCurrentClockInOut(),
        ]);

        if (currentUserData !== null) {
          if (currentCompany.logoUrl) {
            currentCompany.logoUrl = hashLogoUrl(currentCompany.logoUrl);
          }
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          if (currentUserData.permissions && currentUserData.permissions.size > 0) {
            // permissions set is not empty
            currentUserData.permissions = new Set(currentUserData.permissions);
          }

          const me = { ...currentUserData, company: convertDates(currentCompany) };

          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          setCurrentClockInOut(currentClockIn ? convertDates(currentClockIn) : undefined);
          storeUserInfo({ tokens: userTokens, me });
        }

        setIsLoading(false);
      })();
    } else {
      setIsLoading(false);
    }
  }, [userTokens, storeUserInfo]);

  const userContext = useMemo<IUserContext>(
    () => ({
      showClockIn,
      isLoading,
      currentUser,
      currentClockInOut,
      error,
      userTokens,
      setUserTokens: (tokens: UserTokens) => {
        setIsLoading(true);

        storeUserInfo({
          me: currentUser,
          tokens,
        });
      },
      clockIn: async () => {
        const clockInOut = await ClockInOutService.clockIn();

        setCurrentClockInOut(convertDates(clockInOut) ?? undefined);
        setShowClockIn(false);
      },
      clockOut: async (cleanOnly?: boolean) => {
        if (currentClockInOut?.id && !cleanOnly) {
          await ClockInOutService.clockOut(currentClockInOut.id);
        }
        setCurrentClockInOut(undefined);
        setShowClockIn(true);
      },
      setError,
      logOut: () => {
        authService.current.logOut(getResourceApiPath(), userTokens?.token ?? '');
        clearSession();
      },
      hasUserTokensForResource(resourcePath: string) {
        const userInfoStr = localStorage.getItem(getLocalStorageUserKey(resourcePath));

        if (userInfoStr) {
          const userInfo = JSON.parse(userInfoStr) as StoredUserInfo;
          const now = new Date();
          const expiresAt = userInfo.tokens?.expiresAt ? new Date(userInfo.tokens.expiresAt) : now;
          const refreshExpiresAt = userInfo.tokens?.refreshExpiresAt
            ? new Date(userInfo.tokens.refreshExpiresAt)
            : now;

          if (expiresAt.getTime() > now.getTime()) {
            return true;
          }

          if (refreshExpiresAt.getTime() > now.getTime()) {
            return true;
          }

          localStorage.removeItem(getLocalStorageUserKey(resourcePath));
        }

        return false;
      },
    }),
    [
      currentClockInOut,
      currentUser,
      error,
      showClockIn,
      userTokens,
      isLoading,
      getResourceApiPath,
      storeUserInfo,
      clearSession,
    ],
  );

  if (!isReadyToSendRequests) {
    return null;
  }

  return <UserContext.Provider value={userContext}>{children}</UserContext.Provider>;
};

export default UserProvider;
