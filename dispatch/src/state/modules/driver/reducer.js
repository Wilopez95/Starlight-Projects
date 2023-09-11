import * as t from './actionTypes';

const initialState = {
  status: 'UNTOUCHED',
  isLoading: false,
  data: null,
};

export default function driver(state = initialState, action) {
  switch (action.type) {
    case t.FETCH_DRIVER_REQUEST:
      return {
        ...state,
        status: 'LOADING',
        isLoading: true,
        data: null,
      };
    case t.FETCH_DRIVER_SUCCESS:
      return {
        ...state,
        status: 'DONE',
        isLoading: false,
        data: {
          ...action.data,
        },
      };
    case t.FETCH_DRIVER_FAILURE:
      return {
        ...initialState,
        status: 'FAILURE',
      };
    case t.FORGET_DRIVER:
      return {
        ...initialState,
      };
    case t.UPDATE_DRIVER_SUCCESS: {
      return {
        ...state,
        isLoading: false,
        data: action.data,
      };
    }

    default:
      return state;
  }
}
