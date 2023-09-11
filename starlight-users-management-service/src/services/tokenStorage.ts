import { logger } from './logger';
import { redisClient } from './redis';

const STATE_EXPIRATION = 60;

export interface AuthState {
  redirectUri: string;
  code: string;
  claims: string[];
  resource: string;
  subject: string;
  requestId?: string;
  userId?: string;
}

/**
 * Save the refresh token in Redis
 * @param {string} userId - The user's ID.
 * @param {string} token - The token to save.
 * @returns Nothing.
 */
export const saveRefreshToken = async (userId: string, token: string): Promise<void> => {
  const result = await redisClient.set(`refresh:${userId}`, token);

  if (result !== 'OK') {
    return Promise.reject('Error saving token');
  }
};

/**
 * Get the refresh token for a user
 * @param {string} userId - The userId of the user whose token we want to get.
 * @returns A string or null.
 */
export const getRefreshToken = async (userId: string): Promise<string | null> => {
  const result = await redisClient.get(`refresh:${userId}`);

  return result;
};

/**
 * Remove the refresh token for the given user from the Redis store.
 * @param {string} userId - The userId of the user whose token we want to remove.
 */
export const removeRefreshToken = async (userId: string): Promise<number> =>
  redisClient.del(`refresh:${userId}`);

/**
 * Save the state and state data to Redis
 * @param {string} state - The state string that you want to save.
 * @param {AuthState} stateData - AuthState
 * @returns The promise resolves to undefined.
 */
export const saveAuthorizationState = async (
  state: string,
  stateData: AuthState,
): Promise<void> => {
  const filteredData = new Map<string, string>(
    Object.entries(stateData).filter(([, value]) => value !== undefined) as [string, string][],
  );
  try {
    await redisClient.hset(state, filteredData);
    await redisClient.expire(state, STATE_EXPIRATION);
  } catch (error) {
    logger.error(error as Error, 'Error while saving state');
    return Promise.reject('Error saving state');
  }
};

/**
 * It takes a state and returns the corresponding AuthState if it exists, otherwise it returns
 * undefined
 * @param {string} state - The state that was passed to the authorization endpoint.
 * @returns The state data, which is the authorization state.
 */
export const getAuthorizationStateAtomically = async (
  state: string,
): Promise<AuthState | undefined> => {
  const results = await redisClient.multi().hgetall(state).del(state).exec();

  const error = results.find(([error]) => error !== null)?.[0];
  if (error) {
    throw error;
  }

  const stateData = results[0][1] as AuthState;

  if (!stateData.redirectUri) {
    return undefined;
  }

  return {
    ...stateData,
    claims: stateData.claims || [],
  };
};

/**
 * Save the logout state to Redis
 * @param {string} state - A unique string that is used to protect against CSRF attacks.
 * @param {string} redirectUri - The URI to redirect to after the user logs out.
 * @returns Nothing.
 */
export const saveLogoutState = async (state: string, redirectUri: string): Promise<void> => {
  const result = await redisClient.set(`logout:${state}`, redirectUri);

  if (result !== 'OK') {
    return Promise.reject('Error saving logout state');
  }
};

/**
 * Get the logout state from Redis and delete it.
 * @param {string} state - The state parameter is a unique identifier for the logout request.
 * @returns The result of the redisClient.get() call.
 */
export const getAndDeleteLogoutState = async (state: string): Promise<string | null> => {
  const key = `logout:${state}`;
  const result = await redisClient.get(key);

  if (result) {
    await redisClient.del(key);
  }

  return result;
};
