import gql from 'graphql-tag';

import { resolver as coordinatesResolver } from './coordinates.js';
import { resolver as serviceDaysOfWeekResolver } from './serviceDaysOfWeek.js';
import { resolver as timestamp } from './timestamp.js';

export const typeDefs = gql`
  scalar Coordinates
  scalar ServiceDaysOfWeek
  scalar Timestamp
`;

export const resolvers = {
  ...coordinatesResolver,
  ...serviceDaysOfWeekResolver,
  ...timestamp,
};
