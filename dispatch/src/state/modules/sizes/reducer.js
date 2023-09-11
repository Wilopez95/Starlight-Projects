import * as t from './actionTypes';

const initialState = {
  list: [],
  error: null,
  isLoading: false,
  current: {},
};

export default function sizes(state = initialState, action) {
  switch (action.type) {
    case t.FETCH_SIZES_REQUEST:
    case t.REMOVE_SIZE_REQUEST:
    case t.UPDATE_SIZE_REQUEST:
      return {
        ...state,
        isLoading: true,
      };
    case t.FETCH_SIZES_SUCCESS:
      return {
        ...state,
        isLoading: false,
        list: action.sizes,
      };
    case t.FETCH_SIZES_FAILURE:
      return {
        ...state,
        isLoading: false,
        list: [],
        error: action.error,
      };
    case t.FETCH_SIZE_REQUEST:
      return {
        ...state,
        current: {},
        isLoading: true,
      };
    case t.FETCH_SIZE_SUCCESS:
      return {
        ...state,
        isLoading: false,
        current: action.size,
      };
    case t.FETCH_SIZE_FAILURE:
      return {
        ...state,
        isLoading: false,
        current: {},
        error: action.error,
      };
    case t.REMOVE_SIZE_SUCCESS:
      return {
        ...state,
        isLoading: false,
        list: state.list.filter((size) => size.id !== action.id),
      };
    case t.UPDATE_SIZE_SUCCESS:
      return {
        ...state,
        isLoading: false,
        current: action.payload,
        list: state.list.map((size) =>
          action.payload.id === size.id ? { ...action.payload } : size,
        ),
      };
    case t.REMOVE_SIZE_FAILURE:
    case t.UPDATE_SIZE_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.error,
      };
    default:
      return state;
  }
}
