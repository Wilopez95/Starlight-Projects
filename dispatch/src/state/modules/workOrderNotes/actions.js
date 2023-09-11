import moment from 'moment';
import request from '../../../helpers/request';
import { upload } from '../../../helpers/cloudinary';
import * as t from './actionTypes';

export const noteImageOrTextErrorMEssage = 'Text or image is required';

export const forgetWorkOrderNotes = () => (dispatch) => dispatch({ type: t.FORGET_WO_NOTES });

export function createWoNoteReq() {
  return { type: t.CREATE_WO_NOTE_REQUEST };
}

export function createWoNoteSuccess(data) {
  return { type: t.CREATE_WO_NOTE_SUCCESS, data };
}

export function createWoNoteFail(error) {
  return { type: t.CREATE_WO_NOTE_FAILURE, error };
}

export function createWorkOrderNote(workorderId, data, time = moment) {
  return async (dispatch) => {
    if (!data.note.picture && !data.note.text) {
      return Promise.reject(new Error(noteImageOrTextErrorMEssage));
    }
    dispatch(createWoNoteReq());

    const datetime = time().format('MM:DD:YYYY_HH:mm:ss');

    const publicId = `inventory_note_${datetime}`;
    let newData = data;
    try {
      if (data.note.picture) {
        const { data: pictureData } = await upload(data.note.picture, publicId);
        const imageUrl = pictureData.secure_url?.replace(`v${pictureData.version}/`, '');
        newData = {
          ...data,
          note: {
            ...data.note,
            picture: imageUrl,
          },
        };
      }
      const response = await request.post(`workorders/${workorderId}/note`, newData);
      dispatch(createWoNoteSuccess(response.data));
      return response;
    } catch (error) {
      dispatch(createWoNoteFail(error));
      return Promise.reject(error);
    }
  };
}

export function fetchWoNotesReq() {
  return { type: t.FETCH_WO_NOTES_REQUEST };
}

export function fetchWoNotesSuccess(notes = []) {
  return { type: t.FETCH_WO_NOTES_SUCCESS, notes };
}

export function fetchWoNotesFail(error) {
  return { type: t.FETCH_WO_NOTES_FAILURE, error };
}

export const fetchWorkOrderNotes = (workorderId) => async (dispatch) => {
  dispatch(fetchWoNotesReq());

  try {
    const { data } = await request.get(`workorders/${workorderId}/note`);

    dispatch(fetchWoNotesSuccess(data));
  } catch (error) {
    dispatch(fetchWoNotesFail(error));
    Promise.reject(error);
  }
};

export function fetchAllWoNotesReq() {
  return { type: t.FETCH_ALL_WO_NOTES_REQUEST };
}

export function fetchAllWoNotesSuccess(notes = []) {
  return { type: t.FETCH_ALL_WO_NOTES_SUCCESS, notes };
}

export function fetchAllWoNotesFail(error) {
  return { type: t.FETCH_ALL_WO_NOTES_FAILURE, error };
}

export const fetchAllWorkOrderNotes = (workorderId) => async (dispatch) => {
  dispatch(fetchAllWoNotesReq());
  try {
    const { data } = await request.get(`workorders/${Number(workorderId)}/note`);

    // filter out the other actions, only have the actual driver notes
    const notes = [];
    data.forEach((driverNote) => {
      // !NOTE: this doesnt actually produce an array with the text. The array is empty at the bottom of this funciton.
      // filter out the mistake note entries, with no text and no pictures
      if (driverNote.type !== 'NOTE') {
        notes.push('There are no workorder notes');
      }
      if (
        driverNote.type === 'NOTE' &&
        driverNote.note.picture !== 'null' &&
        // driverNote.note.mediaRefId &&
        /\.(gif|jpg|jpeg|tiff|png)$/i.test(driverNote.note.picture) === true
      ) {
        notes.push(driverNote);
      }

      if (
        driverNote.type === 'NOTE' &&
        driverNote.note.picture === undefined &&
        driverNote.note.text !== undefined
      ) {
        notes.push(driverNote);
      }
      // filter out the mistake note entries, with no text and no pictures
      if (
        driverNote.type === 'NOTE' &&
        driverNote.note.text === undefined &&
        driverNote.note.picture === undefined
      ) {
        return;
      }
      for (let i = 0; i < notes.length; i++) {
        if (notes[i] === 'There are no workorder notes') {
          notes.pop(notes[i]);
        }
      }
    });
    // need to pass notes, not data or we get ALL actions dispatcher takes on can
    dispatch(fetchAllWoNotesSuccess(notes));
    // return notes;
  } catch (error) {
    dispatch(fetchAllWoNotesFail(error));
    Promise.reject(error);
  }
};
