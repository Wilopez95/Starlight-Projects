import groupBy from 'lodash/groupBy.js';

import ApplicationError from '../../../errors/ApplicationError.js';
import { availableUmsResources } from '../../../services/ums/auth.js';
import { getHaulingCustomers } from '../../../services/hauling/customers.js';
import getPortalResources from '../../../utils/getPortalResources.js';

export const getAvailableResourcesToLogin = async (ctx) => {
  try {
    const { umsAccessToken } = ctx.state.userTokenData;
    const response = await availableUmsResources(ctx, umsAccessToken);
    const { availableResourceLogins } = response?.data || {};
    if (!availableResourceLogins?.length) {
      return ctx.sendArray([]);
    }

    const customers = await getHaulingCustomers(ctx);
    const customersById = groupBy(customers, 'id');

    const portalResources = getPortalResources(availableResourceLogins, customersById);
    ctx.sendArray(portalResources);
  } catch (err) {
    ctx.logger.error(err);

    if (err.response) {
      ctx.body = err.response.data;
      ctx.status = err.response.status;

      return;
    }

    throw ApplicationError.unknown();
  }
};
