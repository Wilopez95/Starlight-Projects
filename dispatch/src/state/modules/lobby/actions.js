import request from '../../../helpers/request';
import * as t from './actionTypes';

export const fetchAvailableResourceLoginsRequest = () => ({
  type: t.FETCH_AVAILABLE_RESOURCE_LOGINS_REQUEST,
});

export const fetchAvailableResourceLoginsSuccess = (data) => ({
  type: t.FETCH_AVAILABLE_RESOURCE_LOGINS_SUCCESS,
  data,
});

export const fetchAvailableResourceLoginsFailure = (error) => ({
  type: t.FETCH_AVAILABLE_RESOURCE_LOGINS_FAILURE,
  error,
});

export const getAvailableResourceLogins = () => async (dispatch) => {
  dispatch(fetchAvailableResourceLoginsRequest());

  try {
    const { data } = await request.get(`lobby/available-resource-logins`);
    dispatch(fetchAvailableResourceLoginsSuccess(data));
    return data;
  } catch (error) {
    dispatch(fetchAvailableResourceLoginsFailure(error));
    return Promise.reject(error);
  }
};
