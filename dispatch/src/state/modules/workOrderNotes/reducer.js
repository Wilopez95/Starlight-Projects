import { alreadyInState } from '../../../helpers/functions';
import * as t from './actionTypes';

const initialState = {
  isLoading: false,
  isUploading: false,
  list: [],
};

export default function workOrderNotes(state = initialState, action) {
  switch (action.type) {
    case t.FORGET_WO_NOTES:
    case t.FETCH_WO_NOTES_FAILURE:
    case t.FETCH_ALL_WO_NOTES_FAILURE:
      return initialState;
    case t.FETCH_ALL_WO_NOTES_REQUEST:
    case t.FETCH_WO_NOTES_REQUEST:
      return {
        ...state,
        isLoading: true,
      };
    case t.CREATE_WO_NOTE_REQUEST:
      return {
        ...state,
        isUploading: true,
      };
    case t.CREATE_WO_NOTE_FAILURE:
      return {
        ...state,
        isUploading: false,
      };
    case t.FETCH_WO_NOTES_SUCCESS:
    case t.FETCH_ALL_WO_NOTES_SUCCESS:
      return {
        ...state,
        isLoading: false,
        list: action.notes,
      };
    case t.CREATE_WO_NOTE_SUCCESS:
      return {
        ...state,
        isLoading: false,
        list: alreadyInState(action.data.id, state.list)
          ? [...state.list]
          : [action.data, ...state.list],
        isUploading: false,
      };

    default:
      return state;
  }
}
