import axios from 'axios';
import groupBy from 'lodash/groupBy.js';

import BusinessUnitRepo from '../../../repos/businessUnit.js';
import ApiError from '../../../errors/ApiError.js';
import { TRACING_HEADER, UMS_SERVICE_API_URL } from '../../../config.js';

export const getAvailableResoucesToLogin = async ctx => {
  const { schemaName, tenantName } = ctx.state.user;

  const { umsAccessToken } = ctx.state.userTokenData ?? ctx.state.user ?? {};

  try {
    // TODO query with filters, like active only or make sure only active are available
    const response = await axios.post(
      `${UMS_SERVICE_API_URL}/graphql`,
      {
        query: `query { availableResourceLogins {
                    id
                    label
                    subLabel
                    image
                    loginUrl
                    resourceType
                    updatedAt
                    tenantName
                    hasGradingAccess
                    hasRecyclingAccess
                    graderHasBUAccess
                } }`,
      },
      {
        headers: {
          Authorization: `Bearer ${umsAccessToken}`,
          [TRACING_HEADER]: ctx.state.reqId,
        },
      },
    );

    const { availableResourceLogins } = response.data.data;
    // TODO get by ids from availableResourceLogins
    const businessUnits = await BusinessUnitRepo.getInstance(ctx.state).getAllPopulated();
    const businessUnitsById = groupBy(businessUnits, 'id');

    ctx.sendArray(
      availableResourceLogins.map(resource => {
        const id = parseInt(resource.id, 10);
        switch (resource.resourceType) {
          case 'GLOBAL':
            return {
              id: 'systemConfig',
              label: 'Global System Configuration',
              loginUrl: `/${schemaName}/configuration/login?auto=true`,
              targetType: 'globalSystem',
            };

          case 'RECYCLING': {
            const [bu] = businessUnitsById[id] || [];

            return {
              id,
              label: bu?.nameLine1,
              subLabel: bu?.mailingAddress?.addressLine1,
              image: bu?.logoUrl,
              loginUrl: resource.loginUrl,
              targetType: 'recyclingFacility',
              updatedAt: bu?.updatedAt,
              hasRecyclingAccess: resource?.hasRecyclingAccess,
              hasGradingAccess: resource?.hasGradingAccess,
              graderHasBUAccess: resource?.graderHasBUAccess,
              tenantName,
            };
          }

          // TODO get rid of code duplication
          case 'HAULING': {
            const [bu] = businessUnitsById[id] || [];

            return {
              id,
              label: bu?.nameLine1,
              subLabel: bu?.mailingAddress?.addressLine1,
              image: bu?.logoUrl,
              loginUrl: resource.loginUrl,
              targetType: 'hauling/crpt',
              updatedAt: bu?.updatedAt,
              tenantName,
            };
          }

          case 'CUSTOMER_PORTAL': {
            const [bu] = businessUnitsById[id] || [];
            return {
              id,
              label: resource.label,
              subLabel: resource.subLabel,
              image: bu?.logoUrl,
              loginUrl: resource.loginUrl,
              targetType: 'CUSTOMER_PORTAL',
              updatedAt: resource.updatedAt,
              tenantName,
            };
          }

          default:
            return null;
        }
      }),
    );
  } catch (err) {
    ctx.logger.error(err);

    if (err.response) {
      ctx.body = err.response.data;
      ctx.status = err.response.status;

      return;
    }

    throw ApiError.unknown();
  }
};
