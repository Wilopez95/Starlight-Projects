import request from '../../../helpers/request';
import { document as documentSchema } from '../../schema';

export const FETCH_DOCUMENTS_REQUEST = '@documents/FETCH_DOCUMENTS_REQUEST';
export const FETCH_DOCUMENTS_SUCCESS = '@documents/FETCH_DOCUMENTS_SUCCESS';
export const FETCH_DOCUMENTS_FAILURE = '@documents/FETCH_DOCUMENTS_FAILURE';

export function fetchDocumentsReq() {
  return {
    type: FETCH_DOCUMENTS_REQUEST,
  };
}

export function fetchDocumentsSuccess(docs) {
  return {
    type: FETCH_DOCUMENTS_SUCCESS,
    payload: docs,
    meta: {
      schema: [documentSchema],
    },
  };
}

export function fetchDocumentsFailure(error) {
  return {
    type: FETCH_DOCUMENTS_FAILURE,
    error,
  };
}

export function fetchDocuments() {
  return async (dispatch) => {
    dispatch(fetchDocumentsReq());

    try {
      const { data } = await request.get('documents');
      return dispatch(fetchDocumentsSuccess(data));
    } catch (error) {
      dispatch(fetchDocumentsFailure(error));
      return Promise.reject(error);
    }
  };
}

export function shouldFetchDocuments(state) {
  const documentIds = state.documents.ids;
  if (documentIds.length < 1) {
    return true;
  }
  return !(state.documents.isLoading);
}

export function fetchDocsIfNeeded() {
  return (dispatch) => dispatch(fetchDocuments());
  // const state = getState();
  // if (shouldFetchDocuments(state)) {
  //   return dispatch(fetchDocuments());
  // }
  // return null;
}
