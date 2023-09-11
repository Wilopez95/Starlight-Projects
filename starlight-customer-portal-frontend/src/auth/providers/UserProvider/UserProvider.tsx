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
import { AuthService, CompanyService } from '@root/auth/api';
import { ICurrentUser, IUserContext, UserTokens } from '@root/auth/types';
import { StorageKeys } from '@root/auth/types/data-storage';
import {
  GraphqlRequestOptions,
  haulingHttpClient,
  RequestOptions,
  umsHttpClient,
  pricingHttpClient,
} from '@root/core/api/base';
import type { ApiError } from '@root/core/api/base/ApiError';
import { Params, Routes } from '@root/core/consts';
import { convertDates } from '@root/core/helpers';
import { makeControlledPromise } from '@root/core/helpers/asyncCondition';
import type { ICompany, LogoInformation } from '@root/core/types';
import { billingHttpClient } from '@root/finance/api/httpClient';

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
  updateUserInfo: noop,
  setError: noop,
  setCompany: noop,
  setUserTokens: noop,
});

export const hasUserTokensForResource = (resourcePath: string) => {
  console.log(
    '🚀 ~ file: UserProvider.tsx:56 ~ hasUserTokensForResource ~ resourcePath:',
    resourcePath,
  );
  const userInfoStr = localStorage.getItem(getLocalStorageUserKey(resourcePath));
  console.log(
    '🚀 ~ file: UserProvider.tsx:57 ~ hasUserTokensForResource ~ userInfoStr:',
    userInfoStr,
  );

  if (userInfoStr) {
    const userInfo = JSON.parse(userInfoStr) as StoredUserInfo;
    const now = new Date();
    const expiresAt = userInfo?.tokens?.expiresAt ? new Date(userInfo?.tokens?.expiresAt) : now;
    const refreshExpiresAt = userInfo?.tokens?.refreshExpiresAt
      ? new Date(userInfo?.tokens?.refreshExpiresAt)
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
  // return true;
};

const getResourcePath = (customerID: string | undefined): string => {
  const currentPathname = location.pathname;

  if (customerID && currentPathname.includes(`/${Routes.Customers}/`)) {
    return `${Routes.Customers}/${customerID}`;
  }

  return `${Routes.Lobby}`;
};

const getInitialUserInfo = (key: string) =>
  JSON.parse(localStorage.getItem(key) ?? 'null') as StoredUserInfo | null;

interface StoredUserInfo {
  me?: ICurrentUser;
  tokens?: UserTokens;
}

const UserProvider: React.FC = ({ children }) => {
  const location = useLocation();

  const customerPathMatch = useRouteMatch<{ customerId: string }>(
    `/${Routes.Customers}/${Params.customerId}`,
  );

  const authService = useRef<AuthService>(new AuthService());
  const [currentCompany, setCurrentCompany] = useState<ICompany | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [isReadyToSendRequests, setIsReadyToSendRequests] = useState(false);
  const customerID = customerPathMatch?.params.customerId;

  const [error, setError] = useState<string | undefined>();
  const lastStorageKey = useRef<string>(getLocalStorageUserKey(getResourcePath(customerID)));
  const currentUserInfo = useRef<StoredUserInfo | null>(getInitialUserInfo(lastStorageKey.current));
  const [forcedRefresh, forceRefreshUserInfo] = useReducer((i: number) => i + 1, 0);

  const storeUserInfo = useCallback(
    (userInfo: StoredUserInfo) => {
      const resourcePath = getResourcePath(customerID);
      // console.log('🚀 ~ file: UserProvider.tsx:128 ~ customerID:', customerID);
      // console.log('🚀 ~ file: UserProvider.tsx:128 ~ resourcePath:', resourcePath);

      currentUserInfo.current = userInfo;

      const storageKey = getLocalStorageUserKey(resourcePath);
      // console.log('🚀 ~ file: UserProvider.tsx:132 ~ storageKey:', storageKey);

      localStorage.setItem(storageKey, JSON.stringify(userInfo));
      lastStorageKey.current = storageKey;
    },
    [customerID],
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
    const resourcePath = getResourcePath(customerID);
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
  }, [location.pathname, customerID]);

  useEffect(() => {
    let tryRefreshTokenPromise: Promise<UserTokens | null> | null = null;
    let tokensUpdatedPromise: Promise<void> | null = null;

    const tryRefreshToken = (): Promise<UserTokens | null> => {
      const storedUserInfo = currentUserInfo.current;
      const userTokens = storedUserInfo?.tokens;

      if (tryRefreshTokenPromise) {
        return tryRefreshTokenPromise;
      }

      if (!userTokens) {
        return Promise.resolve(null);
      }

      const resourcePath = getResourcePath(customerID);
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
      } catch (err) {
        if ((err as ApiError).statusCode !== 401) {
          throw err;
        }

        if (authService.current.shouldClearTokens()) {
          clearTokens();
          return;
        }

        if (!userTokens) {
          authService.current.goToLogin(getResourcePath(customerID));

          return;
        }

        const p = makeControlledPromise<void>();

        tokensUpdatedPromise = p;

        const newTokens = await tryRefreshToken();

        if (!newTokens) {
          authService.current.goToLogin(getResourcePath(customerID));

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

      if (tokens && tokens.token) {
        request.headers = { ...request.headers, authorization: `Bearer ${tokens.token}` };
      }

      return next();
    };

    haulingHttpClient.registerMiddleware(accessTokenMiddleware);
    pricingHttpClient.registerMiddleware(accessTokenMiddleware);
    billingHttpClient.registerMiddleware(accessTokenMiddleware);
    umsHttpClient.registerMiddleware(accessTokenMiddleware);

    haulingHttpClient.registerMiddleware(unauthenticatedErrorMiddleware);
    pricingHttpClient.registerMiddleware(unauthenticatedErrorMiddleware);
    billingHttpClient.registerMiddleware(unauthenticatedErrorMiddleware);
    umsHttpClient.registerMiddleware(unauthenticatedErrorMiddleware);

    setIsReadyToSendRequests(true);
    return () => {
      setIsReadyToSendRequests(false);

      haulingHttpClient.unregisterMiddleware(accessTokenMiddleware);
      billingHttpClient.unregisterMiddleware(accessTokenMiddleware);
      umsHttpClient.unregisterMiddleware(accessTokenMiddleware);

      haulingHttpClient.unregisterMiddleware(unauthenticatedErrorMiddleware);
      billingHttpClient.unregisterMiddleware(unauthenticatedErrorMiddleware);
      umsHttpClient.unregisterMiddleware(unauthenticatedErrorMiddleware);
    };
  }, [clearTokens, storeUserInfo, customerID]);

  const updateUserInfo = useCallback(
    (forceUpdateUserInfo = false) => {
      if (!isReadyToSendRequests) {
        return;
      }

      const { tokens } = currentUserInfo.current ?? {};

      if (tokens) {
        (async () => {
          const [currentUser, currentCompany] = await Promise.all([
            AuthService.currentUser(tokens.token),
            CompanyService.currentCompany(),
          ]);

          if (currentUser) {
            if (currentCompany.logoUrl) {
              currentCompany.logoUrl = hashLogoUrl(currentCompany.logoUrl);
            }

            const me = { ...currentUser, company: convertDates(currentCompany) };

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
      setError,
      updateUserInfo,
      logOut: () => {
        const token = currentUserInfo.current?.tokens?.token ?? '';

        authService.current.logOut(getResourcePath(customerID), token);
      },
    };
  }, [forcedRefresh, isLoading, error, customerID, currentCompany, storeUserInfo, updateUserInfo]);

  if (!isReadyToSendRequests) {
    return null;
  }
  return <UserContext.Provider value={userContext}>{children}</UserContext.Provider>;
};
export default UserProvider;
