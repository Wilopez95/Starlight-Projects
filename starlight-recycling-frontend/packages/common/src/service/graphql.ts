import {
  InMemoryCache,
  InMemoryCacheConfig,
  Resolvers,
  ApolloClient,
  from,
  HttpLink,
  NormalizedCacheObject,
  ApolloLink,
} from '@apollo/client';
import { DocumentNode } from 'graphql';
import { split } from 'apollo-link';

import { resolvers as commonResolvers, typeDefs as commonTypeDefs } from '../graphql';
import { UserInfo } from '../graphql/api';
import { initCache as initUserCache } from '../graphql/queries/user';
import { AuthLink as DefaultAuthLink, setClient } from './auth';
import { createUploadLink } from 'apollo-upload-client';

export interface ApolloClientOptions {
  initialData?: NormalizedCacheObject;
  graphqlUri?: string;
  resolvers: Resolvers;
  typeDefs: DocumentNode[];
  onForbidden?(): Promise<void> | void;
  cacheConfig?: InMemoryCacheConfig;
  onCacheInit?: (cache: InMemoryCache) => void;
  authLink?: ApolloLink;
  onLogOut: () => void;
  getInitialUserInfo: () => UserInfo | null;
}

export const createApolloClient = ({
  graphqlUri,
  resolvers,
  typeDefs,
  onForbidden,
  cacheConfig,
  onCacheInit,
  authLink,
  onLogOut,
  getInitialUserInfo,
}: ApolloClientOptions) => {
  const cache = new InMemoryCache(cacheConfig);
  const uri = graphqlUri || '/api/graphql';
  const authLinkInstance = authLink || new DefaultAuthLink({ onLogOut, onForbidden, uri });
  const requestLink = new HttpLink({ uri });

  const uploadLink = createUploadLink({ uri });

  const isFile = (value: any) =>
    (typeof File !== 'undefined' && value instanceof File) ||
    (typeof Blob !== 'undefined' && value instanceof Blob);

  const isUpload = ({ variables }: any) => Object.values(variables).some(isFile);

  // @ts-ignore
  const terminalLink = split(isUpload, uploadLink, requestLink);

  const client = new ApolloClient({
    cache,
    link: from([
      authLinkInstance,
      // @ts-ignore
      terminalLink,
    ]),
    resolvers: [commonResolvers, resolvers],
    typeDefs: [...commonTypeDefs, ...typeDefs],
    version: '0.0.1',
  });

  setClient(client);

  //TODO: You can redefine these types to more verbose
  const initCache = (cacheInstance: InMemoryCache) => {
    const userInfo = getInitialUserInfo();

    initUserCache(cacheInstance, userInfo);

    if (onCacheInit) {
      onCacheInit(cacheInstance);
    }
  };

  initCache(cache);
  client.onClearStore(async () => initCache(cache));

  return client;
};
