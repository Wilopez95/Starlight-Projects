import graphqlTools from 'graphql-tools';

import { logger } from '../utils/logger.js';
import * as common from './common.js';
import * as enums from './enums.js';
import * as root from './root.js';
import * as serviceItem from './serviceItem.js';
import * as masterRoute from './masterRoute.js';
import * as workOrder from './workOrder.js';
import * as jobSite from './jobSite.js';
import * as dailyRoute from './dailyRoute.js';
import * as comment from './comment.js';
import * as workOrderMedia from './workOrderMedia.js';
import * as weightTicketMedia from './weightTicketMedia.js';
import * as weightTicket from './weightTicket.js';
import * as workOrderHistory from './workOrderHistory.js';
import * as dailyRouteHistory from './dailyRouteHistory.js';

import * as scalars from './scalars/index.js';

import * as hauling from './hauling.js';
import * as billing from './billing.js';
import * as trashapi from './trashapi.js';

import { AuthorizedDirective, typeDefs as authorizedDirective } from './directives/authorized.js';

const { makeExecutableSchema } = graphqlTools;

export const schema = makeExecutableSchema({
  typeDefs: [
    root.typeDefs,
    common.typeDefs,
    enums.typeDefs,
    scalars.typeDefs,

    serviceItem.typeDefs,
    masterRoute.typeDefs,
    workOrder.typeDefs,
    jobSite.typeDefs,
    dailyRoute.typeDefs,
    comment.typeDefs,
    workOrderMedia.typeDefs,
    weightTicketMedia.typeDefs,
    weightTicket.typeDefs,
    workOrderHistory.typeDefs,
    dailyRouteHistory.typeDefs,

    hauling.typeDefs,
    billing.typeDefs,
    trashapi.typeDefs,
    authorizedDirective,
  ],
  resolvers: [
    root.resolvers,
    enums.resolvers,
    scalars.resolvers,

    masterRoute.resolvers,
    workOrder.resolvers,
    jobSite.resolvers,
    serviceItem.resolvers,
    dailyRoute.resolvers,
    weightTicket.resolvers,
    weightTicketMedia.resolvers,
    workOrderMedia.resolvers,

    hauling.resolvers,
    trashapi.resolvers,
  ],
  schemaDirectives: { authorized: AuthorizedDirective },
  logger: {
    log: (...args) => logger.error(...args),
  },
  resolverValidationOptions: {
    requireResolversForArgs: true,
    requireResolversForResolveType: true,
  },
});
