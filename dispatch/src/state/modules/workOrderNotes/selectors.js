import { createSelector } from 'reselect';

export const getWoNotes = (state) => state.workOrderNotes;

export const createSelectWoNotesLoading = () =>
  createSelector(getWoNotes, (notes) => notes.isLoading);

export const createSelectWoNotesUploading = () =>
  createSelector(getWoNotes, (notes) => notes.isUploading);

export const createSelectWoNotes = () => createSelector(getWoNotes, (notes) => notes.list);
