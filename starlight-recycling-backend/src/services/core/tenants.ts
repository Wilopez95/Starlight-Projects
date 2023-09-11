import axios from 'axios';
import { v4 as uuidV4 } from 'uuid';
import { CORE_SERVICE_API_URL, TRACING_HEADER } from '../../config';
import { Context } from '../../types/Context';
import { createToken } from '../../utils/serviceToken';
import { Tenant, TenantInput } from './types/Tenant';
import { HaulingHttpCrudService, PartialContext } from '../../graphql/createHaulingCRUDResolver';

export { Tenant, TenantInput } from './types/Tenant';

export class HaulingTenantHttpService extends HaulingHttpCrudService<Tenant, TenantInput> {
  path = 'admin/tenants';
}

export const tenantHttpService = new HaulingTenantHttpService();

export const createTenant = async (
  ctx: Context,
  data: TenantInput,
  authorization?: string,
): Promise<Tenant> => {
  let authorizationHeader = authorization;

  if (!authorizationHeader) {
    const token = await createToken(
      {},
      {
        audience: 'core',
        requestId: ctx.reqId,
      },
    );

    authorizationHeader = `ServiceToken ${token}`;
  }

  const response = await axios.post<Tenant>(`${CORE_SERVICE_API_URL}/admin/tenants/`, data, {
    headers: {
      Authorization: authorizationHeader,
      [TRACING_HEADER]: ctx.reqId,
    },
  });

  return response.data;
};

export const getTenants = async ({
  reqId,
  authorization,
}: { reqId?: string; authorization?: string } = {}): Promise<Tenant[]> => {
  const requestId = reqId || uuidV4();
  let authorizationHeader = authorization;

  if (!authorizationHeader) {
    const token = await createToken(
      {},
      {
        audience: 'core',
        requestId: requestId,
      },
    );

    authorizationHeader = `ServiceToken ${token}`;
  }

  const response = await axios.get<Tenant[]>(`${CORE_SERVICE_API_URL}/admin/tenants/`, {
    headers: {
      Authorization: authorizationHeader,
      [TRACING_HEADER]: requestId,
    },
  });

  return response.data;
};

export const getTenantId = async (
  reqId: string,
  tenantName: string,
  authorization?: string,
): Promise<number | undefined> => {
  const tenants = await getTenants({ reqId, authorization });
  const tenant = tenants.find((tenant) => tenant.name === tenantName);

  return tenant?.id;
};

export const getTenantByName = async (ctx: PartialContext, tenantName: string): Promise<Tenant> => {
  const response = await tenantHttpService.get(ctx);
  const tenant = response?.data?.find((tenant) => tenant.name === tenantName);

  if (!tenant) {
    throw new Error(`Tenant "${tenantName}" not found.`);
  }

  return tenant;
};
