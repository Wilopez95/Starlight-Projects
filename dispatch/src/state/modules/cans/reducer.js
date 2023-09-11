// import omit from 'lodash/omit';
// import merge from 'lodash/merge';
import { alreadyInState } from '../../../helpers/functions';

import * as t from './actionTypes';

const initialState = {
  activeCan: false,
  isLoading: false,
  errorOnTransactionsFetch: false,
  current: {},
  list: [],
  filtered: [],
  // ids: [],
  // byId: {},
  filter: {
    date: {
      startDate: null,
      endDate: null,
    },
    bounds: null,
    search: null,
    status: null,
    isRequiredMaintenance: null,
    isOutOfService: null,
    hazardous: null,
    allowNullLocations: null,
    inUse: null,
  },
  refreshCans: false,
};

export default function cans(state = initialState, action) {
  switch (action.type) {
    case t.UNSET_ACTIVE_CAN:
      return {
        ...state,
        activeCan: false,
      };
    case t.FETCH_TRANSACTIONS_REQUEST:
      return {
        ...state,
        activeCan: action.can,
      };
    case t.FETCH_TRANSACTIONS_SUCCESS:
      return {
        ...state,
        activeCan: action.can,
        errorOnTransactionsFetch: false,
      };
    case t.FETCH_TRANSACTIONS_FAILURE:
      return {
        ...state,
        errorOnTransactionsFetch: true,
      };
    case t.CANS_FILTER_CHANGE:
      return {
        ...state,
        filter: { ...state.filter, ...action.data },
        activeCan: false,
      };
    case t.ADD_CAN_SUCCESS:
      return {
        ...state,
        list: alreadyInState(action.data.id, state.list)
          ? [...state.list]
          : [action.data, ...state.list],
        filtered: alreadyInState(action.data.id, state.filtered)
          ? [...state.filtered]
          : [action.data, ...state.filtered],
        refreshCans: true,
      };
    case t.FETCH_CANS_REQUEST:
    case t.FETCH_CAN_REQUEST:
      return {
        ...state,
        isLoading: true,
      };
    case t.RECEIVE_CANS:
      return {
        ...state,
        list: state.activeCan ? state.list : [...action.cans],
        // ids: action.payload.result,
        // byId: merge({ ...state.byId }, action.payload.entities.cans),
      };
    case t.RECEIVE_FILTERED_CANS:
      return {
        ...state,
        isLoading: false,
        filtered: action.cans,
        // ids: action.payload.result,
        // byId: merge({ ...state.byId }, action.payload.entities.cans),
      };
    case t.REMOVE_CAN_SUCCESS:
      return {
        ...state,
        list: state.list.filter((can) => can.id !== action.id),
        filtered: state.filtered.filter((can) => can.id !== action.id),
        refreshCans: true,
      };
    case t.UPDATE_CAN_SUCCESS:
      return {
        ...state,
        list: state.list.map((can) => (can.id === action.data.id ? action.data : can)),
        filtered: state.filtered.map((can) => (can.id === action.data.id ? action.data : can)),
        refreshCans: true,
      };
    case t.DROPOFF_CAN_SUCCESS:
    case t.MOVE_CAN_SUCCESS:
    case t.PICKUP_CAN_SUCCESS:
    case t.TRANSFER_CAN_SUCCESS:
      return {
        ...state,
        refreshCans: true,
      };
    case t.RESET_REFRESH_CANS:
      return {
        ...state,
        refreshCans: false,
      };
    case t.FETCH_CAN_SUCCESS:
      return {
        ...state,
        isLoading: false,
        current: action.data,
      };
    case t.REMOVE_CAN_REQUEST:
    case t.ADD_CAN_REQUEST:
      return {
        ...state,
        refreshCans: false,
      };
    default:
      return state;
  }
}
