import { AuthenticationError } from 'apollo-server-core';
import { type Context } from '../../context';
import { getLoginSessionData, UmsLoginSessionData } from '../../services/session';

export const readState = async (ctx: Context): Promise<UmsLoginSessionData> => {
  const { state } = ctx.request.query as Record<string, string | undefined>;

  if (!state) {
    throw new AuthenticationError('State is required');
  }

  let stateData: UmsLoginSessionData | undefined;

  try {
    // Get state data and immediately remove it from storage to prevent replay attacks.
    // stateData = await tokenStorage.getAuthorizationStateAtomically(state);
    stateData = await getLoginSessionData(ctx, state);
  } catch (error) {
    ctx.logger.error(error as Error, 'Could not retrieve state data');

    throw new AuthenticationError('Failed to obtain token');
  }

  if (!stateData) {
    ctx.logger.info('State data not found');

    throw new AuthenticationError('Failed to obtain token');
  }

  if (stateData.requestId) {
    ctx.reqId = stateData.requestId;
  }

  return stateData;
};
