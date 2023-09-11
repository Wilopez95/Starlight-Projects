import request from '../../../helpers/request';

export const FETCH_CONSTANTS_REQUEST = '@constants/FETCH_CONSTANTS_REQUEST';
export const FETCH_CONSTANTS_SUCCESS = '@constants/FETCH_CONSTANTS_SUCCESS';
export const FETCH_CONSTANTS_FAILURE = '@constants/FETCH_CONSTANTS_FAILURE';

export function fetchConstantsRequest() {
  return { type: FETCH_CONSTANTS_REQUEST };
}

export function fetchConstantsSuccess(constants) {
  return { type: FETCH_CONSTANTS_SUCCESS, payload: constants };
}

export function fetchConstantsFailure(error) {
  return { type: FETCH_CONSTANTS_FAILURE, error };
}

export const fetchConstants = () => async (dispatch) => {
  dispatch(fetchConstantsRequest());

  try {
    const { data } = await request.get('constants');
    dispatch(fetchConstantsSuccess(data));
  } catch (error) {
    dispatch(fetchConstantsFailure(error));
    Promise.reject(error);
  }
};

/**
 * @name shouldFetchConstants
 * @description determines whether or not the constants already exist in state.
 * @param {Object} state the redux store
 * @returns {Boolean} true if it doesnt exist, false if already exists
 */
export function shouldFetchConstants(state) {
  if (!state.constants.hasFetched) {
    return true;
  }
  return !(state.constants.isLoading);
}

/**
 * @name fetchConstantsIfNeeded
 * @description fetches the constants from the API only if
 * they are not already in state.
 * @returns {Function | null} will dispatch an action function or not
 */
export function fetchConstantsIfNeeded() {
  return (
    dispatch,
    // getState
  ) =>
    //   if (shouldFetchConstants(getState())) {
    dispatch(fetchConstants());
  //   }
  //   return null;
}
