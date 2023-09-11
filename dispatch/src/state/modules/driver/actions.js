import moment from 'moment';
import request from '../../../helpers/request';
import { upload } from '../../../helpers/cloudinary';
import * as t from './actionTypes';

export function createDriverRequest() {
  return { type: t.CREATE_DRIVER_REQUEST };
}

export function createDriverSuccess(data) {
  return { type: t.CREATE_DRIVER_SUCCESS, data };
}

export function createDriverFailure(error) {
  return { type: t.CREATE_DRIVER_FAILURE, error };
}

export function createDriver(data) {
  return async (dispatch) => {
    dispatch(createDriverRequest());
    let newData = data;
    try {
      if (data.photo) {
        const datetime = moment().format('MM:DD:YYYY_HH:mm:ss');
        const publicId = `driver_pic_${datetime}`;
        const { data: pictureData } = await upload(data.photo, publicId);
        const imageUrl = pictureData.secure_url.replace(`v${pictureData.version}/`, '');
        newData = {
          ...data,
          photo: imageUrl,
        };
      }
      const response = await request.post('drivers', newData);
      dispatch(createDriverSuccess(response.data));
    } catch (error) {
      dispatch(createDriverFailure(error));
      Promise.reject(error);
    }
  };
}

export function forgetDriver() {
  return { type: t.FORGET_DRIVER };
}

export const fetchDriverRequest = () => ({ type: t.FETCH_DRIVER_REQUEST });

export const fetchDriverSuccess = (data) => ({
  type: t.FETCH_DRIVER_SUCCESS,
  data,
});

export const fetchDriverFailure = (error) => ({
  type: t.FETCH_DRIVER_FAILURE,
  error,
});

export const receiveDriver = (data) => ({
  type: t.RECEIVE_DRIVER,
  data,
});

export const fetchDriver = (id) => async (dispatch) => {
  dispatch(fetchDriverRequest());

  try {
    const { data } = await request.get(`drivers/${id}`);
    dispatch(fetchDriverSuccess(data));
    return data;
  } catch (error) {
    dispatch(fetchDriverFailure(error));
    return Promise.reject(error);
  }
};

export const updateDriverRequest = () => ({
  type: t.UPDATE_DRIVER_REQUEST,
});

export const updateDriverSuccess = (id, data) => ({
  type: t.UPDATE_DRIVER_SUCCESS,
  id,
  data,
});

export const updateDriverFailure = (error) => ({
  type: t.UPDATE_DRIVER_FAILURE,
  error,
});

export const updateDriver = (id, data) => async (dispatch) => {
  dispatch(updateDriverRequest());
  let newData = data;
  try {
    if (data.photo) {
      const datetime = moment().format('MM:DD:YYYY_HH:mm:ss');
      const publicId = `driver_pic_${datetime}`;
      const { data: pictureData } = await upload(data.photo, publicId);
      const imageUrl = pictureData.secure_url.replace(`v${pictureData.version}/`, '');
      newData = {
        ...data,
        photo: imageUrl,
      };
    }
    const response = await request.put(`drivers/${id}`, newData);
    dispatch(updateDriverSuccess(id, response.data));
    return response;
  } catch (error) {
    dispatch(updateDriverFailure(error));
    return Promise.reject(error);
  }
};

export function removeDriverRequest() {
  return { type: t.REMOVE_DRIVER_REQUEST };
}

export function removeDriverSuccess(id) {
  return { type: t.REMOVE_DRIVER_SUCCESS, id };
}

export function removeDriverFailure(error) {
  return { type: t.REMOVE_DRIVER_FAILURE, error };
}

export const removeDriver = (id) => async (dispatch) => {
  dispatch(removeDriverRequest());

  try {
    await request.delete(`drivers/${id}`);
    dispatch(removeDriverSuccess(id));
  } catch (error) {
    dispatch(removeDriverFailure(error));
    Promise.reject(error);
  }
};
