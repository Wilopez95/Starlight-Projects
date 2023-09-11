import { combineReducers } from 'redux';
import merge from 'lodash/merge';
import {
  FETCH_DOCUMENTS_REQUEST,
  FETCH_DOCUMENTS_SUCCESS,
  FETCH_DOCUMENTS_FAILURE,
} from './actions';

const byId = (state = {}, action) => {
  switch (action.type) {
    case FETCH_DOCUMENTS_SUCCESS:
      return merge({ ...state }, action.payload.entities.documents);

    default:
      return state;
  }
};

const ids = (state = [], action) => {
  switch (action.type) {
    case FETCH_DOCUMENTS_SUCCESS:
      return [...action.payload.result];
    default:
      return state;
  }
};

const isLoading = (state = false, action) => {
  switch (action.type) {
    case FETCH_DOCUMENTS_REQUEST:
      return true;
    case FETCH_DOCUMENTS_SUCCESS:
    case FETCH_DOCUMENTS_FAILURE:
      return false;
    default:
      return state;
  }
};

const errorMessage = (state = null, action) => {
  switch (action.type) {
    case FETCH_DOCUMENTS_FAILURE:
      return action.error;
    case FETCH_DOCUMENTS_REQUEST:
    case FETCH_DOCUMENTS_SUCCESS:
      return null;
    default:
      return state;
  }
};

export const initialState = {
  ids: [],
  byId: {},
  isLoading: false,
  errorMessage: null,
};

const documents = combineReducers({
  ids,
  byId,
  isLoading,
  errorMessage,
});

export default documents;
