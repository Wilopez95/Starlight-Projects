import { getTenantEntitiesAndConnection, TenantConnection } from '../../../tenancy';
import entities from '../entities';
import { EntitiesMap } from '../../../tenancy/schemaEntities';

export const getFacilityEntitiesAndConnection = async (
  srn: string,
): Promise<[TenantConnection, EntitiesMap]> => {
  return await getTenantEntitiesAndConnection(srn, Object.values(entities), [
    __dirname + '/../migrations/**/!(*.spec.ts)',
  ]);
};
