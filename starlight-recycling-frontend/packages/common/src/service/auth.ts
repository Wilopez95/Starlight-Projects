import {
  ApolloClient,
  ApolloLink,
  Observable,
  Operation,
  NextLink,
  FetchResult,
  NormalizedCacheObject,
  ServerError,
  ServerParseError,
} from '@apollo/client';
import { GraphQLError } from 'graphql';
import getServiceInfo from '../utils/getServiceInfo';
import { USER_INFO_QUERY, SET_USER_INFO, GET_ME_STR } from '../graphql/queries/user';
import { UserInfo } from '../graphql/api';
import { makeControlledPromise, redirectForLogin } from './utils';

let token: string | null = null;
let client: ApolloClient<NormalizedCacheObject> | null = null;

export const setClient = (c: ApolloClient<NormalizedCacheObject>) => (client = c);

export const getToken = (): string | null => {
  return token;
};

export interface ErrorResponse {
  graphQLErrors?: ReadonlyArray<GraphQLError>;
  networkError?: Error | ServerError | ServerParseError;
  response?: any;
  operation: Operation;
  forward: NextLink;
}

/**
 * Callback to be triggered when an error occurs within the link stack.
 */
export interface ErrorHandler {
  (error: ErrorResponse): Observable<FetchResult> | void;
}

export function onError(errorHandler: ErrorHandler): ApolloLink {
  return new ApolloLink((operation, forward) => {
    return new Observable((observer) => {
      let sub: ZenObservable.Subscription;
      let retriedSub: ZenObservable.Subscription;
      let retriedResult: Observable<FetchResult> | void;

      try {
        sub = forward(operation).subscribe({
          next: (result) => {
            if (result.errors) {
              retriedResult = errorHandler({
                graphQLErrors: result.errors,
                response: result,
                operation,
                forward,
              });

              if (retriedResult) {
                retriedSub = retriedResult.subscribe({
                  next: observer.next.bind(observer),
                  error: observer.error.bind(observer),
                  complete: observer.complete.bind(observer),
                });

                return;
              }
            }
            observer.next(result);
          },
          error: (networkError) => {
            retriedResult = errorHandler({
              operation,
              networkError,
              //Network errors can return GraphQL errors on for example a 403
              graphQLErrors: networkError && networkError.result && networkError.result.errors,
              forward,
            });

            if (retriedResult) {
              retriedSub = retriedResult.subscribe({
                next: observer.next.bind(observer),
                error: observer.error.bind(observer),
                complete: observer.complete.bind(observer),
              });

              return;
            }
            observer.error(networkError);
          },
          complete: () => {
            // disable the previous sub from calling complete on observable
            // if retry is in flight.
            if (!retriedResult) {
              observer.complete.bind(observer)();
            }
          },
        });
      } catch (e) {
        errorHandler({ networkError: e, operation, forward });
        observer.error(e);
      }

      return () => {
        if (sub) {
          sub.unsubscribe();
        }

        if (retriedSub) {
          sub.unsubscribe();
        }
      };
    });
  });
}

interface AuthProviderLinkOptions {
  onForbidden?(): Promise<void> | void;
  onUnauthorized?(errorResponse: ErrorResponse): Observable<FetchResult>;
}

interface AuthLinkOptions extends AuthProviderLinkOptions {
  uri: string;
  onLogOut: () => void;
}

export class AuthProviderLink extends ApolloLink {
  private link: ApolloLink;
  private onForbidden: () => Promise<void> | void = () => {};
  onUnauthorized?: (errorResponse: ErrorResponse) => Observable<FetchResult> | undefined;

  constructor({ onForbidden, onUnauthorized }: AuthProviderLinkOptions = {}) {
    super();

    this.link = onError(this.onError);
    this.onForbidden = onForbidden || (() => {});
    this.onUnauthorized = onUnauthorized;
  }

  onError = (errorResponse: ErrorResponse) => {
    const { graphQLErrors, networkError } = errorResponse;
    const err: ServerParseError = networkError as ServerParseError;

    if (err && err?.statusCode === 401) {
      if (this.onUnauthorized) {
        return this.onUnauthorized(errorResponse);
      }

      throw err;
    }

    if (graphQLErrors && graphQLErrors.length > 0) {
      // Access denied! You need to be authorized to perform this action! - @Authorized has no specified permissions
      const unauthorizedError = graphQLErrors.find(
        (error) =>
          error.message === 'Access denied! You need to be authorized to perform this action!',
      );

      if (unauthorizedError) {
        if (this.onUnauthorized) {
          return this.onUnauthorized(errorResponse);
        }

        throw unauthorizedError;
      }

      // Access denied! You don't have permission for this action! - @Authorized has specified permissions
      const forbiddenError = graphQLErrors.find(
        (error) => error.message === "Access denied! You don't have permission for this action!",
      );

      if (forbiddenError) {
        this.onForbidden();
      }
    }
  };

  request(operation: Operation, forward: NextLink): Observable<FetchResult> | null {
    const context = operation.getContext();
    const headers = { ...context.headers };

    if (client) {
      // read from cache
      const data = client.readQuery<{ userInfo: UserInfo }>({
        query: USER_INFO_QUERY,
      });

      let token;
      let resource;

      if (data?.userInfo?.token) {
        token = data.userInfo.token;
      } else {
        const params = new URLSearchParams(window.location.search);
        token = params.get('token');
      }

      if (data?.userInfo?.resource) {
        resource = data.userInfo.resource;
      }

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      if (token && resource) {
        headers['X-Resource'] = resource;
      }
    }

    operation.setContext({
      headers,
    });

    return this.link.request(operation, forward);
  }
}

export class AuthLink extends AuthProviderLink {
  private uri: string;
  private onLogOut: () => void;
  private refreshPromise: null | Promise<any> = null;

  constructor({ onLogOut, onForbidden, uri }: AuthLinkOptions) {
    super({ onForbidden });
    this.onLogOut = onLogOut;
    this.uri = uri;

    this.onUnauthorized = this.refreshToken;
  }

  refreshToken = ({ operation, forward }: ErrorResponse) => {
    if (!client) {
      throw new Error('Missing apollo client');
    }

    const data = client.readQuery<{ userInfo: UserInfo }>({
      query: USER_INFO_QUERY,
    });

    if (!data?.userInfo?.refreshToken) {
      redirectForLogin(this.onLogOut);

      return;
    }

    const expirationDate = new Date(data?.userInfo?.refreshExpiresAt || Date.now());

    if (expirationDate.getTime() <= Date.now()) {
      redirectForLogin(this.onLogOut);

      return;
    }

    return new Observable<FetchResult>((observer) => {
      const { host, protocol } = window.location;
      const serviceInfo = getServiceInfo();

      let refreshUrl = '';

      if (serviceInfo) {
        const { platformAccount, service, serviceAccount } = serviceInfo;

        refreshUrl = `${protocol}//${host}/api/${platformAccount}/${service}/${serviceAccount}/refresh`;
      }

      if (this.refreshPromise !== null) {
        this.refreshPromise
          .then((result) => {
            // we have data and can send it to back up the link chain
            const nextObserver = this.request(operation, forward);

            if (nextObserver) {
              nextObserver.subscribe(observer);
            } else {
              // eslint-disable-next-line
              console.error('Missin next observer in auth.js');
            }

            this.refreshPromise = null;

            return result;
          })
          .catch((err) => {
            // fetch was cancelled so it's already been cleaned up in the unsubscribe

            if (err.statusCode === 401) {
              redirectForLogin(this.onLogOut);
            }

            if (err.name === 'AbortError') {
              return;
            }

            observer.error(err);
          });

        return;
      }

      const p = makeControlledPromise<any>();

      this.refreshPromise = p;

      fetch(refreshUrl, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: data?.userInfo.refreshToken }),
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          }

          return response.json().then((body) => {
            const error = new Error(body?.message || response.statusText);

            Object.assign(error, body);

            (error as any).status = response.status;
            (error as any).statusCode = response.status;

            return Promise.reject(error);
          });
        })
        .then((result) => {
          const { token } = result;

          return fetch(this.uri, {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              query: GET_ME_STR,
            }),
          })
            .then((response) => response.json())
            .then((response) => response.data.me)
            .then((userInfo) => ({
              tokens: result,
              userInfo,
            }));
        })
        .then(({ tokens, userInfo }) => {
          const { token, refreshToken, expiresIn, refreshExpiresIn } = tokens;

          return client?.mutate({
            mutation: SET_USER_INFO,
            variables: {
              userInfo: {
                ...data?.userInfo,
                ...userInfo,
                token,
                refreshToken: refreshToken || '',
                expiresAt: new Date(Date.now() + (expiresIn || 3600) * 1000).toUTCString(),
                refreshExpiresAt: new Date(
                  Date.now() + (refreshExpiresIn || 3600) * 1000,
                ).toUTCString(),
              },
            },
          });
        })
        .then((result) => p.resolveHard(result))
        .catch(() => {
          redirectForLogin(this.onLogOut);
        });
    });
  };
}
