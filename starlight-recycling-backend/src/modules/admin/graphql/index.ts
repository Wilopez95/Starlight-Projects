import { NonEmptyArray } from 'type-graphql';
import RecyclingQueuesResolver from './resolvers/RecyclingQueues';

// eslint-disable-next-line @typescript-eslint/ban-types
export const resolvers: NonEmptyArray<any> = [RecyclingQueuesResolver];
