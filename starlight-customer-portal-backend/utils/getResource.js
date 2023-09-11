import kebabCase from 'lodash/fp/kebabCase.js';
import { CUSTOMER_PORTAL } from '../consts/resources.js';
import { TENANT_NAME } from '../config.js';

const resourceType = kebabCase(CUSTOMER_PORTAL);
const resourceBase = `srn:${TENANT_NAME}:${resourceType}`;

const getResource = (customerId) => `${resourceBase}:${customerId}`;

export default getResource;
