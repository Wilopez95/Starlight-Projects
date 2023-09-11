import { makeExecutableSchema } from 'graphql-tools';

import { logger } from '../utils/logger.js';
import * as common from './common.js';
import * as enums from './enums.js';
import * as root from './root.js';
import * as customer from './customer.js';
import * as creditCard from './creditCard.js';
import * as jobSite from './jobSite.js';
import * as order from './order.js';
import * as orderLineItem from './orderLineItem.js';
import * as payment from './payment.js';
import * as invoice from './invoice.js';
import * as invoiceEmail from './invoiceEmail.js';
import * as payout from './payout.js';
import * as settlement from './settlement.js';
import * as settlementTransaction from './settlementTransaction.js';
import * as statement from './statement.js';
import * as statementEmail from './statementEmail.js';
import * as financeCharge from './financeCharge.js';
import * as financeChargeEmail from './financeChargeEmail.js';
import * as businessUnit from './businessUnit.js';
import * as bankDeposit from './bankDeposit.js';
import * as batchStatement from './batchStatement.js';
import * as generationJob from './generationJob.js';
import * as businessLine from './businessLine.js';
import * as subscription from './subscription.js';

import { AuthorizedDirective, typeDefs as authorizedDirective } from './directives/authorized.js';

export const schema = makeExecutableSchema({
  typeDefs: [
    root.typeDefs,
    common.typeDefs,
    enums.typeDefs,

    customer.typeDefs,
    creditCard.typeDefs,
    jobSite.typeDefs,
    order.typeDefs,
    orderLineItem.typeDefs,
    payment.typeDefs,
    invoice.typeDefs,
    invoiceEmail.typeDefs,
    payout.typeDefs,
    settlement.typeDefs,
    settlementTransaction.typeDefs,
    statement.typeDefs,
    statementEmail.typeDefs,
    financeCharge.typeDefs,
    financeChargeEmail.typeDefs,
    businessUnit.typeDefs,
    bankDeposit.typeDefs,
    batchStatement.typeDefs,
    generationJob.typeDefs,
    authorizedDirective,
    businessLine.typeDefs,
    subscription.typeDefs,
  ],
  resolvers: [
    root.resolvers,
    enums.resolvers,

    businessLine.resolvers,
    customer.resolvers,
    creditCard.resolvers,
    jobSite.resolvers,
    order.resolvers,
    orderLineItem.resolvers,
    payment.resolvers,
    invoice.resolvers,
    invoiceEmail.resolvers,
    payout.resolvers,
    settlement.resolvers,
    settlementTransaction.resolvers,
    statement.resolvers,
    statementEmail.resolvers,
    financeCharge.resolvers,
    financeChargeEmail.resolvers,
    businessUnit.resolvers,
    bankDeposit.resolvers,
    batchStatement.resolvers,
    generationJob.resolvers,
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
