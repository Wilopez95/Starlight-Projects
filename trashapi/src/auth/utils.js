import { getTenantWithConfig } from '../models/tenants.js';
import { SENTRY_ENABLE } from '../config.js';
import Sentry from '../services/sentry/index.js';

/**
 * It sets the user data on the request object
 * @param req - The request object
 * @param userInfo - This is the user information that is passed in from the client.
 */
export const setUserData = async (req, userInfo) => {
  const firstName = userInfo.firstName || '';
  const lastName = userInfo.lastName || '';
  let { name } = userInfo;
  let { businessUnitId } = userInfo;

  if (!businessUnitId) {
    const resource = userInfo.resource || '';
    const [, , , buId] = resource.split(':');
    businessUnitId = isNaN(parseInt(buId)) ? businessUnitId : buId;
  }

  if (!name) {
    name = firstName && lastName ? `${firstName} ${lastName}` : 'system';
  }

  req.user = {
    ...userInfo,
    name,
    firstName,
    lastName,
    userId: userInfo.id || 'system',
    businessUnitId,
  };

  const data = await getTenantWithConfig(userInfo.tenantId);
  req.user.username = req.user.name; // alias
  req.user.companyName = data.legalName;
  req.user.phone = data.twilioNumber;
  req.user.enableManifest = data.enableManifest;

  if (SENTRY_ENABLE) {
    Sentry.configureScope(scope => {
      const { id, username, tenantId, email } = req.user;
      scope.setUser({
        id,
        username,
        tenantId,
        email,
      });
    });
  }
};
