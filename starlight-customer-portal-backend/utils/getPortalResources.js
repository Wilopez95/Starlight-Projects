import { CUSTOMER_PORTAL } from '../consts/resources.js';

const getPortalResources = (availableResources, customersById) =>
  availableResources.reduce((acc, resource) => {
    const { id: resourceId, resourceType, loginUrl, label, subLabel } = resource || {};

    if (resourceType !== CUSTOMER_PORTAL) {
      return acc;
    }

    const [customer] = customersById[parseInt(resourceId, 10)] || [];
    if (!customer) {
      return acc;
    }

    const {
      id,
      businessName,
      firstName,
      lastName,
      businessUnit: { nameLine1, nameLine2 },
    } = customer;

    acc.push({
      id,
      label: label ?? businessName ?? `${firstName} ${lastName}`,
      subLabel: subLabel ?? nameLine1 ?? nameLine2,
      loginUrl,
      targetType: CUSTOMER_PORTAL,
    });
    return acc;
  }, []);

export default getPortalResources;
