import * as R from 'ramda';
import { alreadyInState } from '../../../helpers/functions';
import { emptyWorkOrderFilter } from '../../../utils/emptyWorkOrderFilter';
import * as t from './actionTypes';

const emptyWorkOrder = {
  driver: {},
  location1: {},
  location2: {},
};

export const initialState = {
  active: false,
  isLoading: false,
  single: emptyWorkOrder,
  isUpdating: false,
  list: [],
  filtered: [],
  filter: {
    ...emptyWorkOrderFilter,
  },
  suspended: [],
  billableService: [],
  serviceMaterials: [],
};

export default function workOrders(state = initialState, action) {
  switch (action.type) {
    case t.FETCH_WOS_REQUEST:
    case t.FETCH_WO_REQUEST:
    case t.FETCH_SUSPENDED_ORDERS_REQUEST:
      return {
        ...state,
        isLoading: true,
      };
    case t.SET_ACTIVE_WO:
      return {
        ...state,
        active: action.workOrder,
      };
    case t.UNSET_ACTIVE_WO:
      return {
        ...state,
        active: false,
      };
    case t.CREATE_WO_SUCCESS:
      return {
        ...state,
        list: alreadyInState(action.data.id, state.list)
          ? [...state.list]
          : [action.data, ...state.list],
        filtered: alreadyInState(action.data.id, state.filtered)
          ? [...state.filtered]
          : [action.data, ...state.filtered],
        isLoading: false,
        isUpdating: false,
      };
    case t.CREATE_WO_REQUEST:
    case t.UPDATE_WOS_REQUEST:
    case t.UPDATE_WO_REQUEST:
      return {
        ...state,
        isLoading: true,
        isUpdating: true,
      };
    case t.UPDATE_WOS_FAILURE:
    case t.UPDATE_WO_FAILURE:
      return {
        ...state,
        isLoading: false,
        isUpdating: false,
      };
    case t.UPDATE_WOS_SUCCESS: {
      let newFiltered = state.filtered.filter(
        (item) => !action.data.map((datum) => datum.id).includes(item.id),
      );
      newFiltered = [...action.data, ...newFiltered];
      let newList = state.list.filter(
        (item) => !action.data.map((datum) => datum.id).includes(item.id),
      );
      newList = [...action.data, ...newList];
      return {
        ...state,
        list: newList,
        filtered: newFiltered,
        isUpdating: false,
        isLoading: false,
      };
    }
    case t.UPDATE_WO_SUCCESS:
      return {
        ...state,
        list: R.map((item) => (item.id === action.data.id ? action.data : item), state.list),
        filtered: R.map(
          (item) => (item.id === action.data.id ? action.data : item),
          state.filtered,
        ),
        isUpdating: false,
        isLoading: false,
      };
    case t.UPDATE_WO_SUCCESS_WITH_DRIVER:
      return {
        ...state,
        list: R.map(
          (item) => (item.id === action.data.id ? { ...action.data, driver: action.driver } : item),
          state.list,
        ),
        filtered: R.map(
          (item) => (item.id === action.data.id ? { ...action.data, driver: action.driver } : item),
          state.filtered,
        ),
        isUpdating: false,
        isLoading: false,
      };
    case t.FETCH_WO_SUCCESS:
      return {
        ...state,
        isLoading: false,
        single: action.workOrder,
      };
    case t.FETCH_WOS_SUCCESS:
      return {
        ...state,
        active: state.active,
        filter: {
          ...state.filter,
        },
        single: {
          ...state.single,
        },
        filtered: action.workorders,
        isLoading: false,
        list: action.workorders,
      };
    case t.FETCH_SUSPENDED_ORDERS_SUCCESS:
      return {
        ...state,
        suspended: action.data,
      };
    case t.REMOVE_WO_SUCCESS:
      return {
        ...state,
        list: R.filter(R.complement(R.propEq('id', action.id)), state.list),
        filtered: R.filter(R.complement(R.propEq('id', action.id)), state.filtered),
      };

    case t.WOS_FILTER_CHANGE:
      return {
        ...state,
        filter: {
          ...state.filter,
          ...action.data,
        },
      };
    case t.WOS_FILTER_RESET: {
      return initialState;
    }
    case t.RECEIVE_FILTERED_WOS: {
      return {
        ...state,
        // currentOrders: action.workorders,
        filtered: action.workorders,
      };
    }
    case t.SET_WOS:
      return {
        ...state,
        filtered: action.data,
      };
    case t.FORGET_WO:
      return {
        ...state,
        single: emptyWorkOrder,
      };
    case t.FETCH_SUSPENDED_ORDERS_FAILURE:
      return {
        ...state,
        isLoading: false,
      };
    default:
      return state;
  }
}
