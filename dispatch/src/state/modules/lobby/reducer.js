import * as t from './actionTypes';

const initialState = {
  isLoading: false,
  data: null,
};

export default function lobby(state = initialState, action) {
  switch (action.type) {
    case t.FETCH_AVAILABLE_RESOURCE_LOGINS_REQUEST:
      return {
        ...state,
        status: 'LOADING',
        isLoading: true,
        data: null,
      };
    case t.FETCH_AVAILABLE_RESOURCE_LOGINS_SUCCESS:
      return {
        ...state,
        status: 'DONE',
        isLoading: false,
        data: {
          ...action.data,
        },
      };
    case t.FETCH_AVAILABLE_RESOURCE_LOGINS_FAILURE:
      return {
        ...initialState,
        status: 'FAILURE',
      };

    default:
      return state;
  }
}
