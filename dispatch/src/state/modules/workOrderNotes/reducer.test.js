import {
  fetchWoNotesReq,
  fetchWoNotesFail,
  fetchWoNotesSuccess,
  createWoNoteSuccess,
  createWoNoteReq,
  createWoNoteFail,
} from './actions';
import workOrderNotes from './reducer';

const initialState = {
  isLoading: false,
  isUploading: false,
  list: [],
};

describe('notes reducer', () => {
  it('should have initial state', () => {
    const state = workOrderNotes(undefined, {});
    expect(state).toEqual(initialState);
  });

  it('should toggle isLoading state', () => {
    let state = workOrderNotes(undefined, fetchWoNotesReq());

    expect(state.isLoading).toBe(true);

    state = workOrderNotes(state, fetchWoNotesSuccess([]));

    expect(state.isLoading).toBe(false);
  });

  it('should replace workorder notes on fetchWoNotesSuccess', () => {
    const fetchedNotes = [{ id: 1 }, { id: 2 }];
    const state = workOrderNotes(undefined, fetchWoNotesSuccess(fetchedNotes));

    expect(state.list).toEqual(fetchedNotes);
  });

  it('should set isUploading to true on CREATE_WO_NOTE_REQUEST', () => {
    const state = workOrderNotes(undefined, createWoNoteReq());

    expect(state.isUploading).toBe(true);
  });
  it('should set isUploading to false on CREATE_WO_NOTE_FAILURE', () => {
    const state = workOrderNotes(
      { ...initialState, isUploading: true },
      createWoNoteFail(),
    );

    expect(state.isUploading).toBe(false);
  });

  it('should add note on create action', () => {
    const testNote = { id: 1 };
    const state = workOrderNotes(
      { ...initialState, isUploading: true },
      createWoNoteSuccess(testNote),
    );

    expect(state.list.length).toBe(1);
    expect(state.list[0]).toEqual(testNote);
    expect(state.isLoading).toEqual(false);
    expect(
      workOrderNotes(state, createWoNoteSuccess(testNote)).list.length,
    ).toBe(1);
    expect(
      workOrderNotes(state, createWoNoteSuccess({ id: 2 })).list.length,
    ).toBe(2);
  });

  it('should set state to inital on FETCH_WO_NOTES_FAILURE', () => {
    const state = workOrderNotes(
      { ...initialState, isUploading: true, list: [{ id: 2 }, { id: 1 }] },
      fetchWoNotesFail(),
    );

    expect(state).toEqual(initialState);
  });
});
