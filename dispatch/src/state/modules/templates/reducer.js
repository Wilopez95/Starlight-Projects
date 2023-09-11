import { combineReducers } from 'redux';
import omit from 'lodash/omit';
import merge from 'lodash/merge';
import * as t from './actionTypes';

const ids = (state = [], action) => {
  switch (action.type) {
    case t.FETCH_TEMPLATES_SUCCESS:
      return [...action.payload.result];
    case t.CREATE_TEMPLATE_SUCCESS:
      return [...state, action.payload.result];
    case t.DELETE_TEMPLATE_SUCCESS:
      return state.filter((id) => id !== action.id);
    default:
      return state;
  }
};

const byId = (state = {}, action) => {
  switch (action.type) {
    case t.CREATE_TEMPLATE_SUCCESS:
    case t.UPDATE_TEMPLATE_SUCCESS:
      return {
        ...state,
        ...action.payload.entities.templates,
      };
    case t.FETCH_TEMPLATES_SUCCESS:
      return merge({ ...state }, action.payload.entities.templates);
    case t.DELETE_TEMPLATE_SUCCESS:
      return {
        ...omit(state, action.id),
      };
    default:
      return state;
  }
};

const isLoading = (state = false, action) => {
  switch (action.type) {
    case t.FETCH_TEMPLATES_REQUEST:
    case t.CREATE_TEMPLATE_REQUEST:
    case t.UPLOAD_LOGO_REQUEST:
    case t.GET_TEMPLATE_REQUEST:
      return true;
    case t.FETCH_TEMPLATES_SUCCESS:
    case t.FETCH_TEMPLATES_FAILURE:
    case t.CREATE_TEMPLATE_SUCCESS:
    case t.CREATE_TEMPLATE_FAILURE:
    case t.UPLOAD_LOGO_SUCCESS:
    case t.UPLOAD_LOGO_FAILURE:
    case t.GET_TEMPLATE_SUCCESS:
    case t.GET_TEMPLATE_FAILURE:
      return false;
    default:
      return state;
  }
};

const errorMessage = (state = null, action) => {
  switch (action.type) {
    case t.FETCH_TEMPLATES_FAILURE:
    case t.CREATE_TEMPLATE_FAILURE:
    case t.UPLOAD_LOGO_FAILURE:
    case t.GET_TEMPLATE_FAILURE:
      return action.error;
    case t.FETCH_TEMPLATES_REQUEST:
    case t.CREATE_TEMPLATE_REQUEST:
    case t.FETCH_TEMPLATES_SUCCESS:
    case t.CREATE_TEMPLATE_SUCCESS:
    case t.UPLOAD_LOGO_REQUEST:
    case t.UPLOAD_LOGO_SUCCESS:
    case t.GET_TEMPLATE_REQUEST:
    case t.GET_TEMPLATE_SUCCESS:
      return null;
    default:
      return state;
  }
};

const current = (state = {}, action) => {
  switch (action.type) {
    case t.SET_TEMPLATE:
      return {
        ...state,
        ...action.template,
      };
    case t.GET_TEMPLATE_SUCCESS:
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
};

const logo = (state = {}, action) => {
  switch (action.type) {
    case t.UPLOAD_LOGO_SUCCESS:
      return {
        ...state,
        path: action.payload.data.location,
        key: action.payload.data.key,
      };
    case t.CLEAR_PREVIEW_IMAGE:
      return {
        ...state,
        path: '',
        key: '',
      };
    default:
      return state;
  }
};

const templates = combineReducers({
  ids,
  byId,
  current,
  isLoading,
  errorMessage,
  logo,
});

export default templates;
