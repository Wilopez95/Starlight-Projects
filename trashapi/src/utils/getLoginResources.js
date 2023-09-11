import { GLOBAL, HAULING } from '../consts/resources.js';

const getLoginResources = ({ availableResourceLogins, businessUnitsById, tenantName }) =>
  availableResourceLogins.reduce((acc, resource) => {
    const { id, resourceType, loginUrl } = resource || {};
    if (![HAULING, GLOBAL].includes(resourceType)) {
      return acc;
    }

    if (resourceType === GLOBAL) {
      acc.push({
        id: 'systemConfig',
        label: 'Administration',
        loginUrl: `/${tenantName}/configuration/login?auto=true`,
        targetType: 'globalSystem',
      });
      return acc;
    }

    const resourceId = parseInt(id, 10);
    const [bu] = businessUnitsById[resourceId] || [];
    if (!bu) {
      return acc;
    }

    acc.push({
      id: resourceId,
      label: bu?.nameLine1,
      subLabel: bu?.mailingAddress?.addressLine1,
      image: bu?.logoUrl,
      loginUrl,
      targetType: 'hauling/crpt',
      updatedAt: bu?.updatedAt,
      tenantName,
    });
    return acc;
  }, []);

export default getLoginResources;
