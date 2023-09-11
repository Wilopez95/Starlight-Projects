import { combineReducers } from 'redux';
import omit from 'lodash/omit';
import merge from 'lodash/merge';
import * as t from './actionTypes';

const isLoading = (state = false, action) => {
  switch (action.type) {
    case t.FETCH_MATERIALS_REQUEST:
    case t.FETCH_MATERIAL_REQUEST:
    case t.REMOVE_MATERIAL_REQUEST:
    case t.UPDATE_MATERIAL_REQUEST:
    case t.CREATE_MATERIAL_REQUEST:
      return true;
    case t.FETCH_MATERIALS_SUCCESS:
    case t.FETCH_MATERIAL_SUCCESS:
    case t.FETCH_MATERIALS_FAILURE:
    case t.FETCH_MATERIAL_FAILURE:
    case t.REMOVE_MATERIAL_SUCCESS:
    case t.REMOVE_MATERIAL_FAILURE:
    case t.UPDATE_MATERIAL_FAILURE:
    case t.UPDATE_MATERIAL_SUCCESS:
    case t.CREATE_MATERIAL_FAILURE:
    case t.CREATE_MATERIAL_SUCCESS:
      return false;
    default:
      return state;
  }
};

const error = (state = null, action) => {
  switch (action.type) {
    case t.FETCH_MATERIALS_FAILURE:
    case t.CREATE_MATERIAL_FAILURE:
    case t.FETCH_MATERIAL_FAILURE:
    case t.REMOVE_MATERIAL_FAILURE:
    case t.UPDATE_MATERIAL_FAILURE:
      return action.error;
    case t.FETCH_MATERIALS_SUCCESS:
    case t.FETCH_MATERIAL_SUCCESS:
    case t.REMOVE_MATERIAL_SUCCESS:
    case t.UPDATE_MATERIAL_SUCCESS:
    case t.CREATE_MATERIAL_SUCCESS:
    case t.FETCH_MATERIALS_REQUEST:
    case t.FETCH_MATERIAL_REQUEST:
    case t.REMOVE_MATERIAL_REQUEST:
    case t.UPDATE_MATERIAL_REQUEST:
    case t.CREATE_MATERIAL_REQUEST:
      return null;
    default:
      return state;
  }
};

const byId = (state = {}, action) => {
  switch (action.type) {
    case t.FETCH_MATERIAL_SUCCESS:
    case t.FETCH_MATERIALS_SUCCESS:
      return merge({ ...state }, action.payload.entities.materials);
    case t.UPDATE_MATERIAL_SUCCESS:
    case t.CREATE_MATERIAL_SUCCESS:
      return {
        ...state,
        ...action.payload.entities.materials,
      };
    case t.REMOVE_MATERIAL_SUCCESS:
      return {
        ...omit(state, action.id),
      };
    default:
      return state;
  }
};

const ids = (state = [], action) => {
  switch (action.type) {
    case t.FETCH_MATERIAL_SUCCESS:
    case t.FETCH_MATERIALS_SUCCESS:
      return [...action.payload.result];
    case t.CREATE_MATERIAL_SUCCESS:
      return [...state, action.payload.result];
    case t.REMOVE_MATERIAL_SUCCESS:
      return state.filter((id) => id !== action.id);
    default:
      return state;
  }
};

const materials = combineReducers({
  byId,
  ids,
  isLoading,
  error,
});

export default materials;
