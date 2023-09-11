import Axios from 'axios';
import logger from '../../../../../services/logger';
// import { generateAdminToken } from '../token';

export interface GetTenantParams {
  id: string;
}

export const getTenant = async ({ id }: GetTenantParams): Promise<void> => {
  try {
    const authorizationHeader = 'Bearer sdfsf34ferrds';
    // TODO optimize this call
    const response = await Axios.get(`/api/oauth2/me/${id}`, {
      headers: {
        Authorization: authorizationHeader,
      },
    });

    // eslint-disable-next-line
    // @ts-ignore
    ctx.userInfo = {
      id: response.data.sub,
      email: response.data.email,
      firstName: response.data.firstName,
      lastName: response.data.lastName,
      permissions: response.data.permissions,
      resource: response.data.resource,
    };
  } catch (e) {
    if (!e.response || e.response.status !== 401) {
      logger.error(e);
    }
  }
};
