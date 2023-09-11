import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import { useLocation, useRouteMatch } from 'react-router-dom';

import { AuthService, ClockInOutService, CompanyService } from '@root/api';
import {
  billingHttpClient,
  GraphqlRequestOptions,
  haulingHttpClient,
  pricingHttpClient,
  RequestOptions,
  routePlannerHttpClient,
  umsHttpClient,
} from '@root/api/base';
import { type ApiError } from '@root/api/base/ApiError';
import { IClockInOut } from '@root/api/clockInOut/types';
import { Params, Routes } from '@root/consts';
import { convertDates, getResourceApiPath } from '@root/helpers';
import { makeControlledPromise } from '@root/helpers/asyncCondition';
import {
  type ICompany,
  type ICurrentUser,
  type LogoInformation,
  type UserTokens,
} from '@root/types';

interface IUserContext {
  currentUser?: ICurrentUser;
  currentClockInOut?: IClockInOut;
  error?: string;
  userTokens?: UserTokens;
  isLoading: boolean;
  logOut: () => void;
  updateUserInfo(forced?: boolean): void;
  setError(error?: string): void;
  setCompany(company: LogoInformation | ICompany): void;
  clockOut: (cleanOnly?: boolean) => Promise<void>;
  clockIn: () => Promise<void>;
  setUserTokens: (tokens: UserTokens) => void;
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
  isLoading: true,
  logOut: noop,
  clockOut: noop,
  clockIn: noop,
  updateUserInfo: noop,
  setError: noop,
  setCompany: noop,
  setUserTokens: noop,
});

export const hasUserTokensForResource = (resourcePath: string) => {
  const userInfoStr = localStorage.getItem(getLocalStorageUserKey(resourcePath));

  if (userInfoStr) {
    const userInfo = JSON.parse(userInfoStr) as StoredUserInfo;
    const now = new Date();
    const expiresAt = userInfo.tokens?.expiresAt ? new Date(userInfo.tokens.expiresAt) : now;
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

const getInitialUserInfo = (key: string) =>
  JSON.parse(localStorage.getItem(key) ?? 'null') as StoredUserInfo | null;

interface StoredUserInfo {
  me?: Omit<ICurrentUser, 'permissions'> & { permissions: string[] };
  tokens?: UserTokens;
}

const UserProvider: React.FC = ({ children }) => {
  const location = useLocation();
  const businessUnitPathMatch = useRouteMatch<{ businessUnit: string }>(
    `/${Routes.BusinessUnits}/${Params.businessUnit}`,
  );
  const businessUnitPathMatchLogin = useRouteMatch<{ businessUnit: string; tenantName: string }>(
    `/${Params.tenantName}/${Routes.BusinessUnits}/${Params.businessUnit}`,
  );
  const authService = useRef<AuthService>(new AuthService());
  const [isLoading, setIsLoading] = useState(true);
  const [isReadyToSendRequests, setIsReadyToSendRequests] = useState(false);
  let businessUnit = businessUnitPathMatch?.params.businessUnit;

  if (!businessUnit && businessUnitPathMatchLogin?.params.tenantName !== Routes.Configuration) {
    businessUnit = businessUnitPathMatchLogin?.params.businessUnit;
  }

  const [error, setError] = useState<string | undefined>();
  const [currentClockInOut, setCurrentClockInOut] = useState<IClockInOut | undefined>();
  const lastStorageKey = useRef<string>(getLocalStorageUserKey(getResourcePath(businessUnit)));
  const currentUserInfo = useRef<StoredUserInfo | null>(getInitialUserInfo(lastStorageKey.current));
  const [forcedRefresh, forceRefreshUserInfo] = useReducer((i: number) => i + 1, 0);

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

      const resourcePath = getResourceApiPath(currentUser?.tenantName, businessUnit);
      const p = authService.current.tryRefreshToken(resourcePath, userTokens.refreshToken);

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
      const { me: currentUser, tokens: userTokens } = currentUserInfo.current ?? {};

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
          authService.current.goToLogin(getResourceApiPath(currentUser?.tenantName, businessUnit));

          return;
        }

        const p = makeControlledPromise<void>();

        tokensUpdatedPromise = p;

        const newTokens = await tryRefreshToken();

        // if no tokens and it is not login page
        if (!newTokens) {
          authService.current.goToLogin(getResourceApiPath(currentUser?.tenantName, businessUnit));

          return;
        }

        storeUserInfo({
          me: currentUser,
          tokens: newTokens,
        });
        forceRefreshUserInfo();
        p.resolveWith();

        request.headers = { ...request.headers, authorization: `Bearer ${newTokens.token}` };

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
        request.headers = { ...request.headers, authorization: `Bearer ${tokens.token}` };
      }

      return next();
    };

    haulingHttpClient.registerMiddleware(accessTokenMiddleware);
    pricingHttpClient.registerMiddleware(accessTokenMiddleware);
    billingHttpClient.registerMiddleware(accessTokenMiddleware);
    umsHttpClient.registerMiddleware(accessTokenMiddleware);
    routePlannerHttpClient.registerMiddleware(accessTokenMiddleware);

    haulingHttpClient.registerMiddleware(unauthenticatedErrorMiddleware);
    pricingHttpClient.registerMiddleware(unauthenticatedErrorMiddleware);
    billingHttpClient.registerMiddleware(unauthenticatedErrorMiddleware);
    umsHttpClient.registerMiddleware(unauthenticatedErrorMiddleware);
    routePlannerHttpClient.registerMiddleware(unauthenticatedErrorMiddleware);

    setIsReadyToSendRequests(true);

    return () => {
      setIsReadyToSendRequests(false);

      haulingHttpClient.unregisterMiddleware(accessTokenMiddleware);
      billingHttpClient.unregisterMiddleware(accessTokenMiddleware);
      umsHttpClient.unregisterMiddleware(accessTokenMiddleware);
      routePlannerHttpClient.unregisterMiddleware(accessTokenMiddleware);

      haulingHttpClient.unregisterMiddleware(unauthenticatedErrorMiddleware);
      billingHttpClient.unregisterMiddleware(unauthenticatedErrorMiddleware);
      umsHttpClient.unregisterMiddleware(unauthenticatedErrorMiddleware);
      routePlannerHttpClient.unregisterMiddleware(unauthenticatedErrorMiddleware);
    };
  }, [clearTokens, storeUserInfo, businessUnit]);

  const updateUserInfo = useCallback(
    (forceUpdateUserInfo = false) => {
      if (!isReadyToSendRequests) {
        return;
      }

      const { tokens } = currentUserInfo.current ?? {};

      if (tokens) {
        (async () => {
          const [currentUser, currentCompany, currentClockIn] = await Promise.all([
            AuthService.currentUser(tokens.token),
            CompanyService.currentCompany(),
            ClockInOutService.getCurrent(),
          ]);

          if (currentUser) {
            if (currentCompany.logoUrl) {
              currentCompany.logoUrl = hashLogoUrl(currentCompany.logoUrl);
            }

            const me = { ...currentUser, company: convertDates(currentCompany) };

            setCurrentClockInOut(convertDates(currentClockIn) ?? undefined);
            storeUserInfo({
              me,
              tokens,
            });

            if (forceUpdateUserInfo) {
              forceRefreshUserInfo();
            }
          }

          setIsLoading(false);
        })();
      } else {
        setIsLoading(false);
      }
    },
    [isReadyToSendRequests, forceRefreshUserInfo, storeUserInfo],
  );

  useEffect(() => {
    updateUserInfo();
  }, [forcedRefresh, updateUserInfo]);

  const userContext = useMemo<IUserContext>(() => {
    // This is necessary to introduce an artificial dependency on this property.
    // TODO: Find a less hackish way via MobX or something.
    forcedRefresh;

    return {
      isLoading,
      currentClockInOut,
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
      setCompany: (company: LogoInformation | ICompany) => {
        const currentUser = currentUserInfo.current?.me;

        if (!currentUser) {
          return;
        }

        storeUserInfo({
          ...currentUserInfo.current,
          me: {
            ...currentUser,
            company: {
              ...currentUser.company,
              ...company,
              logoUrl: hashLogoUrl(company.logoUrl),
            } as ICompany,
          },
        });
        forceRefreshUserInfo();
      },
      clockIn: async () => {
        const clockInOut = await ClockInOutService.clockIn();

        setCurrentClockInOut(convertDates(clockInOut) ?? undefined);
      },
      clockOut: async (cleanOnly?: boolean) => {
        if (currentClockInOut?.id && !cleanOnly) {
          await ClockInOutService.clockOut(currentClockInOut.id);
        }

        setCurrentClockInOut(undefined);
      },
      setError,
      updateUserInfo,
      logOut: () => {
        const tenantName = currentUserInfo.current?.me?.tenantName;
        const token = currentUserInfo.current?.tokens?.token ?? '';

        authService.current.logOut(getResourceApiPath(tenantName, businessUnit), token);
      },
    };
  }, [
    forcedRefresh,
    isLoading,
    currentClockInOut,
    error,
    businessUnit,
    storeUserInfo,
    updateUserInfo,
  ]);

  if (!isReadyToSendRequests) {
    return null;
  }

  return <UserContext.Provider value={userContext}>{children}</UserContext.Provider>;
};

export default UserProvider;
