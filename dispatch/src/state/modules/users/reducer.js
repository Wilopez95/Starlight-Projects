/* eslint-disable complexity */
import { combineReducers } from 'redux';
import merge from 'lodash/merge';
import * as t from './actionTypes';

const ids = (state = [], action) => {
  switch (action.type) {
    case t.FETCH_USERS_SUCCESS:
      return [...action.payload.result];
    case t.CREATE_USER_SUCCESS:
      return [action.payload.result, ...state];
    default:
      return state;
  }
};

function byId(state = {}, action) {
  switch (action.type) {
    case t.FETCH_USERS_SUCCESS:
      return merge({ ...state }, action.payload.entities.users);
    case t.CREATE_USER_SUCCESS:
    case t.UPDATE_USER_SUCCESS:
    case t.CHANGE_ROLE_SUCCESS:
      return {
        ...state,
        ...action.payload.entities.users,
      };
    default:
      return state;
  }
}

function isLoading(state = false, action) {
  switch (action.type) {
    case t.FETCH_USERS_REQUEST:
    case t.CHANGE_ROLE_REQUEST:
    case t.UPDATE_USER_REQUEST:
    case t.CREATE_USER_REQUEST:
    case t.UPDATE_PASSWORD_REQUEST:
      return true;
    case t.UPDATE_PASSWORD_FAILURE:
    case t.UPDATE_PASSWORD_SUCCESS:
    case t.FETCH_USERS_FAILURE:
    case t.FETCH_USERS_SUCCESS:
    case t.UPDATE_USER_SUCCESS:
    case t.UPDATE_USER_FAILURE:
    case t.CREATE_USER_SUCCESS:
    case t.CREATE_USER_FAILURE:
    case t.CHANGE_ROLE_FAILURE:
    case t.CHANGE_ROLE_SUCCESS:
      return false;
    default:
      return state;
  }
}

function error(state = null, action) {
  switch (action.type) {
    case t.FETCH_USERS_FAILURE:
    case t.UPDATE_USER_FAILURE:
    case t.CREATE_USER_FAILURE:
    case t.UPDATE_PASSWORD_FAILURE:
    case t.CHANGE_ROLE_FAILURE:
      return action.error || action.error.message;
    case t.FETCH_USERS_SUCCESS:
    case t.UPDATE_PASSWORD_SUCCESS:
    case t.UPDATE_USER_SUCCESS:
    case t.CREATE_USER_SUCCESS:
    case t.CHANGE_ROLE_SUCCESS:
      return null;
    default:
      return state;
  }
}

const users = combineReducers({
  isLoading,
  error,
  byId,
  ids,
});

export default users;
