import { ApolloCache } from '@apollo/client';

export type ResolverFn = (parent: any, args: any, { cache }: { cache: ApolloCache<any> }) => any;

export interface ResolverMap {
  [field: string]: ResolverFn;
}
