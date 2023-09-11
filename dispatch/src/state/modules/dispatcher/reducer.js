import { emptyWorkOrderFilter } from '../../../utils/emptyWorkOrderFilter';
import {
  DISPATCH_FILTER_CHANGE,
  UNPUBLISHED_CHANGE,
  CLEAR_UNPUBLISHED_CHANGES,
  RESET_DISPATCHER_FILTER,
} from './actions';

export const initialState = {
  filter: {
    ...emptyWorkOrderFilter,
  },
  unpublished: 0,
};

export default function dispatcher(state = initialState, action) {
  switch (action.type) {
    case DISPATCH_FILTER_CHANGE:
      return {
        ...state,
        filter: {
          ...state.filter,
          ...action.data,
        },
      };
    case UNPUBLISHED_CHANGE:
      return {
        ...state,
        unpublished: state.unpublished + 1,
      };
    case CLEAR_UNPUBLISHED_CHANGES:
      return {
        ...state,
        unpublished: 0,
      };
    case RESET_DISPATCHER_FILTER:
      return {
        ...state,
        filter: {
          ...emptyWorkOrderFilter,
        },
      };
    default:
      return state;
  }
}
