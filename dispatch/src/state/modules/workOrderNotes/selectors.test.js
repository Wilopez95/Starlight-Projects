import {
  getWoNotes,
  createSelectWoNotesLoading,
  createSelectWoNotesUploading,
  createSelectWoNotes,
} from './selectors';

describe('Work Order Notes Selectors', () => {
  test('getWoNotes -- should select the workOrderNotes state', () => {
    const notesState = {
      isUploading: false,
      isLoading: false,
      list: [],
    };
    const mockedState = {
      workOrderNotes: notesState,
    };
    expect(getWoNotes(mockedState)).toEqual(notesState);
  });
  test('createSelectWoNotesLoading -- should select the workOrderNotes isLoading state', () => {
    const selectWoNotesLoading = createSelectWoNotesLoading();
    const isLoading = true;
    const mockedState = {
      workOrderNotes: {
        isUploading: false,
        isLoading: true,
        list: [],
      },
    };
    expect(selectWoNotesLoading(mockedState)).toEqual(isLoading);
  });
  test('createSelectWoNotesUploading -- should select the workOrderNotess isUploading', () => {
    const selectWoNotesUploading = createSelectWoNotesUploading();
    const isUploading = true;
    const mockedState = {
      workOrderNotes: {
        isUploading: true,
        isLoading: false,
        list: [],
      },
    };
    expect(selectWoNotesUploading(mockedState)).toEqual(isUploading);
  });
  test('createSelectWoNotes -- should select the workOrderNotes list', () => {
    const selectWoNotes = createSelectWoNotes();
    const list = [{ id: 1, note: { payload: 'text' } }];
    const mockedState = {
      workOrderNotes: {
        isUploading: false,
        isLoading: false,
        list: [{ id: 1, note: { payload: 'text' } }],
      },
    };
    expect(selectWoNotes(mockedState)).toEqual(list);
  });
});
