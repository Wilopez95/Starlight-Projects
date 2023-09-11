import { Context } from '../../types/Context';
import { HaulingContact } from './types/HaulingContact';
import axios from 'axios';
import { CORE_SERVICE_API_URL, TRACING_HEADER } from '../../config';
import { HaulingHttpCrudService } from '../../graphql/createHaulingCRUDResolver';

export const getContacts = async (
  ctx: Context,
  filter: { customerId: number },
  authorization?: string,
): Promise<HaulingContact[]> => {
  const auth = authorization || (await HaulingHttpCrudService.getAuthorizationHeader(ctx));

  const response = await axios.get<HaulingContact[]>(`${CORE_SERVICE_API_URL}/contacts`, {
    headers: {
      Authorization: auth,
      [TRACING_HEADER]: ctx.reqId,
    },
    params: {
      customerId: filter.customerId,
    },
  });

  return response.data;
};
