import axios from 'axios';
import { v4 as uuidV4 } from 'uuid';
import { CORE_SERVICE_API_URL, TRACING_HEADER } from '../../config';
import Me from '../../types/Me';

export const getMeByHaulingToken = async ({
  reqId,
  token,
}: { reqId?: string; token?: string } = {}): Promise<Me> => {
  const requestId = reqId || uuidV4();
  const authorizationHeader = `Bearer ${token}`;

  const response = await axios.get<Me>(`${CORE_SERVICE_API_URL}/auth/me`, {
    headers: {
      Authorization: authorizationHeader,
      [TRACING_HEADER]: requestId,
    },
  });

  return response.data;
};
