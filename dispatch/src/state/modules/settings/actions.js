import request from '../../../helpers/request';
import * as t from './actionTypes';

export const updateSettingRequest = () => ({
  type: t.UPDATE_SETTING_REQUEST,
});

export const updateSettingSuccess = (data) => ({
  type: t.UPDATE_SETTING_SUCCESS,
  data,
});

export const updateSettingFailure = (error) => ({
  type: t.UPDATE_SETTING_FAILURE,
  error,
});

export const updateSetting = (data) => async (dispatch) => {
  dispatch(updateSettingRequest());

  try {
    const response = await request.put('/settings', data);
    dispatch(updateSettingSuccess(response.data));
    return response;
  } catch (error) {
    dispatch(updateSettingFailure(error));
    return Promise.reject(error);
  }
};

export const fetchSettingRequest = () => ({ type: t.FETCH_SETTING_REQUEST });

export const fetchSettingFailure = (error) => ({
  type: t.FETCH_SETTING_FAILURE,
  error,
});

export const receiveSetting = (data = []) => ({
  type: t.RECEIVE_SETTING,
  data,
});

export const receiveMapSetting = (data = []) => ({
  type: t.RECEIVE_MAP_SETTING,
  data,
});

export const receiveDriverSetting = (data = []) => ({
  type: t.RECEIVE_DRIVER_SETTING,
  data,
});

export const fetchSetting = (keys) => async (dispatch) => {
  dispatch(fetchSettingRequest());
  try {
    const { data } = await request.get('/settings', { keys });

    dispatch(receiveSetting(data));
    return data;
  } catch (error) {
    dispatch(fetchSettingFailure(error));
    return Promise.reject(error);
  }
};

export const fetchSettingByKey = (key, businessUnitId) => async (dispatch) => {
  dispatch(fetchSettingRequest());
  try {
    const { data } = await request.get('/settings', {
      params: { keys: key, businessUnitId },
    });
    if (key === 'map') {
      dispatch(receiveMapSetting(...data, businessUnitId));
    } else {
      dispatch(receiveDriverSetting(...data, businessUnitId));
    }
    dispatch(receiveSetting(...data));
    return data;
  } catch (error) {
    dispatch(fetchSettingFailure(error));
    return Promise.reject(error);
  }
};
