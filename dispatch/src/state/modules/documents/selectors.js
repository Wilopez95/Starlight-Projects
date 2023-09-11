import { createSelector } from 'reselect';
import { initialState } from './reducer';

export const getDocuments = (state) => state.documents || initialState;

export const documentsById = (state) => getDocuments(state).byId;

export const getDocumentIds = (state) => getDocuments(state).ids;

export const selectDocuments = createSelector([getDocumentIds, documentsById], (ids, docs) =>
  ids.map((id) => docs[id]),
);
