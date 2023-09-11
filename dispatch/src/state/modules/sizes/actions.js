import request from '../../../helpers/request';
import * as t from './actionTypes';

export function createSizeRequest() {
  return { type: t.CREATE_SIZE_REQUEST };
}

export function createSizeSuccess(data) {
  return { type: t.CREATE_SIZE_SUCCESS, data };
}

export function createSizeFailure(error) {
  return { type: t.CREATE_SIZE_FAILURE, error };
}

export function createSize(size) {
  return async (dispatch) => {
    dispatch(createSizeRequest());

    try {
      const { data } = await request.post('sizes', size);
      dispatch(createSizeSuccess(data));
    } catch (error) {
      dispatch(createSizeFailure(error));
      Promise.reject(error);
    }
  };
}

export const updateSizeRequest = () => ({
  type: t.UPDATE_SIZE_REQUEST,
});

export const updateSizeSuccess = (data) => ({
  type: t.UPDATE_SIZE_SUCCESS,
  payload: data,
});

export const updateSizeFailure = (error) => ({
  type: t.UPDATE_SIZE_FAILURE,
  error,
});

export const updateSize = (id, size) => async (dispatch) => {
  dispatch(updateSizeRequest());

  try {
    const { data } = await request.put(`sizes/${id}`, size);

    dispatch(updateSizeSuccess(data));
  } catch (error) {
    dispatch(updateSizeFailure(error));
    Promise.reject(error);
  }
};

export function removeSizeRequest() {
  return { type: t.REMOVE_SIZE_REQUEST };
}

export function removeSizeSuccess(id) {
  return { type: t.REMOVE_SIZE_SUCCESS, id };
}

export function removeSizeFailure(error) {
  return { type: t.REMOVE_SIZE_FAILURE, error };
}

export const removeSize = (id) => async (dispatch) => {
  dispatch(removeSizeRequest());

  try {
    await request.delete(`sizes/${id}`);
    dispatch(removeSizeSuccess(id));
  } catch (error) {
    dispatch(removeSizeFailure(error));
    Promise.reject(error);
  }
};

export const fetchSizeRequest = () => ({ type: t.FETCH_SIZE_REQUEST });

export const fetchSizeSuccess = (size) => ({
  type: t.FETCH_SIZE_SUCCESS,
  size,
});

export const fetchSizeFailure = (error) => ({
  type: t.FETCH_SIZE_FAILURE,
  error,
});

export const fetchSize = (id) => async (dispatch) => {
  dispatch(fetchSizeRequest());

  try {
    const { data } = await request.get(`sizes/${id}`);
    dispatch(fetchSizeSuccess(data));
    // return data;
  } catch (error) {
    dispatch(fetchSizeFailure(error));
    Promise.reject(error);
  }
};

export const fetchSizesRequest = () => ({ type: t.FETCH_SIZES_REQUEST });

export const fetchSizesSuccess = (sizes) => ({
  type: t.FETCH_SIZES_SUCCESS,
  sizes,
});

export const fetchSizesFailure = (error) => ({
  type: t.FETCH_SIZES_FAILURE,
  error,
});

export const fetchSizes = () => async (dispatch) => {
  dispatch(fetchSizesRequest());

  try {
    const { data } = await request.get('sizes');

    dispatch(fetchSizesSuccess(data));
    return data;
  } catch (error) {
    dispatch(fetchSizesFailure(error));
    return Promise.reject(error);
  }
};
