import {
  FETCH_CONSTANTS_REQUEST,
  FETCH_CONSTANTS_SUCCESS,
  FETCH_CONSTANTS_FAILURE,
} from './actions';

const initialState = {
  isLoading: false,
  hasFetched: false,
  error: '',
  can: {
    action: {},
    size: [],
  },
  location: {
    type: {},
  },
  workOrder: {
    action: {},
    status: {},
    material: [],
    note: {
      transitionState: {},
    },
  },
  import: {
    type: {},
  },
};

export default function constants(state = initialState, action) {
  switch (action.type) {
    case FETCH_CONSTANTS_REQUEST:
      return {
        ...state,
        isLoading: true,
      };
    case FETCH_CONSTANTS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        hasFetched: true,
        ...action.payload,
      };
    case FETCH_CONSTANTS_FAILURE:
      return {
        ...state,
        isLoading: false,
        hasFetched: false,
        error: action.error,
      };
    default:
      return state;
  }
}
