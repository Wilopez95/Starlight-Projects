import { kebabCase } from 'lodash';

import { Resource, ResourceType } from '../entities/Resource';
import { Role } from '../entities/Role';
import { logger } from '../services/logger';

enum CoreBusinessUnitType {
  HAULING = 'hauling',
  RECYCLING_FACILITY = 'recyclingFacility',
}

interface BusinessUnitMessage {
  id: string;
  tenantName: string;
  tenantId: string;
  type: CoreBusinessUnitType;
  loginUrl: string;
}

const buildBuSrn = (tenant: string, type: ResourceType, id: string) =>
  `srn:${tenant}:${kebabCase(type)}:${id}`;

export const createOrUpdateBusinessUnitResource = async (
  msg: BusinessUnitMessage,
): Promise<void> => {
  const { id, tenantName, tenantId, type, loginUrl } = msg;

  let resourceType: ResourceType;

  switch (type) {
    case CoreBusinessUnitType.HAULING:
      resourceType = ResourceType.HAULING;
      break;
    case CoreBusinessUnitType.RECYCLING_FACILITY:
      resourceType = ResourceType.RECYCLING;
      break;
    default:
      logger.error(
        `createOrUpdateBusinessUnitResource received unknown type message: ${type as string}`,
      );

      return;
  }

  const srn = buildBuSrn(tenantName, resourceType, id);

  let resource = await Resource.findOne({ where: { srn } });
  let isNewResource = false;

  if (!resource) {
    isNewResource = true;
    resource = new Resource();

    resource.id = `${id}`;
    resource.srn = srn;
    resource.tenantId = tenantId;
    resource.type = resourceType;
  }

  if (loginUrl) {
    resource.loginUrl = loginUrl;
  }

  try {
    await resource.save();
  } catch (error) {
    logger.error(error as Error, `Failed to save resource ${resource.srn}`);
  }

  if (!isNewResource) {
    return;
  }

  const tenantRoles = await Role.find({
    where: { tenantId },
    relations: ['policyTemplates', 'policyTemplates.role'],
  });

  for (const role of tenantRoles) {
    const template = role.policyTemplates.find(
      (t) => t.resourceType === (resource as Resource).type,
    );

    if (template) {
      const policy = template.createPolicyForResource(resource);

      await policy.save();
    }
  }
};
