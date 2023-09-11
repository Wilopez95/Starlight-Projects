import request from '../../../helpers/request';
import { material as materialSchema } from '../../schema';
import * as t from './actionTypes';

export function createMaterialRequest() {
  return { type: t.CREATE_MATERIAL_REQUEST };
}

export function createMaterialSuccess(data) {
  return {
    type: t.CREATE_MATERIAL_SUCCESS,
    payload: data,
    meta: {
      schema: materialSchema,
    },
  };
}

export function createMaterialFailure(error) {
  return { type: t.CREATE_MATERIAL_FAILURE, error };
}

export function createMaterial(material) {
  return async (dispatch) => {
    dispatch(createMaterialRequest());

    try {
      const { data } = await request.post('materials', material);
      dispatch(createMaterialSuccess(data));
    } catch (error) {
      dispatch(createMaterialFailure(error));
      Promise.reject(error);
    }
  };
}

export const updateMaterialRequest = () => ({
  type: t.UPDATE_MATERIAL_REQUEST,
});

export const updateMaterialSuccess = (data) => ({
  type: t.UPDATE_MATERIAL_SUCCESS,
  payload: data,
  meta: {
    schema: materialSchema,
  },
});

export const updateMaterialFailure = (error) => ({
  type: t.UPDATE_MATERIAL_FAILURE,
  error,
});

export const updateMaterial = (id, material) => async (dispatch) => {
  dispatch(updateMaterialRequest());

  try {
    const { data } = await request.put(`materials/${id}`, material);

    dispatch(updateMaterialSuccess(data));
  } catch (error) {
    dispatch(updateMaterialFailure(error));
    Promise.reject(error);
  }
};

export function removeMaterialRequest() {
  return { type: t.REMOVE_MATERIAL_REQUEST };
}

export function removeMaterialSuccess(id) {
  return { type: t.REMOVE_MATERIAL_SUCCESS, id };
}

export function removeMaterialFailure(error) {
  return { type: t.REMOVE_MATERIAL_FAILURE, error };
}

export const removeMaterial = (id) => async (dispatch) => {
  dispatch(removeMaterialRequest());

  try {
    await request.delete(`materials/${id}`);
    dispatch(removeMaterialSuccess(id));
  } catch (error) {
    dispatch(removeMaterialFailure(error));
    Promise.reject(error);
  }
};

export const fetchMaterialRequest = () => ({ type: t.FETCH_MATERIAL_REQUEST });

export const fetchMaterialSuccess = (material) => ({
  type: t.FETCH_MATERIAL_SUCCESS,
  payload: material,
  meta: {
    schema: materialSchema,
  },
});

export const fetchMaterialFailure = (error) => ({
  type: t.FETCH_MATERIAL_FAILURE,
  error,
});

export const fetchMaterial = (id) => async (dispatch) => {
  dispatch(fetchMaterialRequest());

  try {
    const { data } = await request.get('materials', { params: { id } });

    dispatch(fetchMaterialSuccess(data));
  } catch (error) {
    dispatch(fetchMaterialFailure(error));
    Promise.reject(error);
  }
};

export const fetchMaterialsRequest = () => ({
  type: t.FETCH_MATERIALS_REQUEST,
});

export const fetchMaterialsSuccess = (materials) => ({
  type: t.FETCH_MATERIALS_SUCCESS,
  payload: materials,
  meta: {
    schema: [materialSchema],
  },
});

export const fetchMaterialsFailure = (error) => ({
  type: t.FETCH_MATERIALS_FAILURE,
  error,
});

export const fetchMaterials = () => async (dispatch) => {
  dispatch(fetchMaterialsRequest());

  try {
    const { data } = await request.get('materials');

    dispatch(fetchMaterialsSuccess(data));
  } catch (error) {
    dispatch(fetchMaterialsFailure(error));
    Promise.reject(error);
  }
};

export function shouldFetchMaterials(state) {
  const mats = state.materials.ids;
  if (mats.length < 1) {
    return true;
  }
  return !(state.materials.isLoading);
}

export function fetchMaterialsIfNeeded() {
  return (dispatch) => dispatch(fetchMaterials());
  // if (shouldFetchMaterials(getState())) {
  //   return dispatch(fetchMaterials());
  // } else {
  //   return Promise.resolve();
  // }
}
