/* eslint-disable no-unused-vars */
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import sinon from 'sinon';
import * as cloudinary from '../../../helpers/cloudinary';
import request from '../../../helpers/request';
import * as actions from './actions';
import * as t from './actionTypes';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

const data = { note: { picture: 'pic' } };

const imageData = {
  data: {
    // eslint-disable-next-line babel/camelcase
    secure_url: 'v1498044180/123',
    version: '1498044180',
  },
};

const fakeMoment = () => ({ format: () => 3 });

describe('WorkOrderNotes Actions', () => {
  describe('Actions for create workorder note', () => {
    let sandbox;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should return correct action object', () => {
      const error = 'Test error';
      expect(actions.createWoNoteReq()).toEqual({
        type: t.CREATE_WO_NOTE_REQUEST,
      });
      expect(actions.createWoNoteSuccess(data)).toEqual({
        type: t.CREATE_WO_NOTE_SUCCESS,
        data,
      });
      expect(actions.createWoNoteFail(error)).toEqual({
        type: t.CREATE_WO_NOTE_FAILURE,
        error,
      });
    });

    it('should be error on send request without image and text', async () => {
      const store = mockStore();
      const woId = 1;

      try {
        await store.dispatch(
          actions.createWorkOrderNote(woId, { note: {} }, fakeMoment),
        );
      } catch (err) {
        expect(err.message).toBe(actions.noteImageOrTextErrorMEssage);
      }
    });

    it('should not appear error of requiring text or image to note', async () => {
      const store = mockStore();
      const error = new Error('Network error');
      const woId = 1;
      const noteWithText = {
        note: {
          text: 'I am note',
        },
      };
      const noteWithPicture = {
        note: {
          picture: 'picture.jpg',
        },
      };

      sandbox.stub(request, 'post').returns(Promise.reject(error));

      try {
        await store.dispatch(
          actions.createWorkOrderNote(woId, noteWithText, fakeMoment),
        );
      } catch (error) {
        expect(actions.noteImageOrTextErrorMEssage).not.toBe(error.message);
      }

      try {
        await store.dispatch(
          actions.createWorkOrderNote(woId, noteWithPicture, fakeMoment),
        );
      } catch (error) {
        expect(actions.noteImageOrTextErrorMEssage).not.toBe(error.message);
      }
    });

    it('should send request with only text', async () => {
      const store = mockStore();
      const woId = 1;
      const path = `workorders/${woId}/note`;
      const data = {
        note: {
          text: '123',
        },
      };

      sandbox.stub(request, 'post').returns(Promise.resolve({ data }));

      const expectedActions = [
        actions.createWoNoteReq(),
        actions.createWoNoteSuccess(data),
      ];

      await store.dispatch(actions.createWorkOrderNote(woId, data, fakeMoment));

      expect(request.post.args[0][0]).toEqual(path);
      expect(request.post.args[0][1]).toEqual(data);

      expect(store.getActions()).toEqual(expectedActions);
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('should send request with only image', async () => {
      const store = mockStore();
      const woId = 1;
      const data = {
        note: {
          picture: '123',
        },
      };
      const publicId = `inventory_note_${fakeMoment().format()}`;
      const path = `workorders/${woId}/note`;

      sandbox.stub(cloudinary, 'upload').returns(Promise.resolve(imageData));
      sandbox.stub(request, 'post').returns(Promise.resolve({ data }));

      const expectedActions = [
        actions.createWoNoteReq(),
        actions.createWoNoteSuccess(data),
      ];

      await store.dispatch(actions.createWorkOrderNote(woId, data, fakeMoment));

      expect(cloudinary.upload.args[0][0]).toEqual(data.note.picture);
      expect(cloudinary.upload.args[0][1]).toEqual(publicId);

      expect(request.post.args[0][0]).toEqual(path);
      expect(request.post.args[0][1]).toEqual(data);

      expect(store.getActions()).toEqual(expectedActions);
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('should delete version from the image url', async () => {
      const store = mockStore();
      const woId = 1;
      // eslint-disable-next-line camelcase
      const imageUrl = imageData.data?.secure_url?.replace(
        `v${imageData.data.version}/`,
        '',
      );
      const data = {
        note: {
          picture: imageUrl,
        },
      };
      const path = `workorders/${woId}/note`;

      sandbox.stub(cloudinary, 'upload').returns(Promise.resolve(imageData));
      sandbox.stub(request, 'post').returns(Promise.resolve({ data }));

      await store.dispatch(actions.createWorkOrderNote(woId, data, fakeMoment));

      expect(request.post.args[0][0]).toEqual(path);
      expect(request.post.args[0][1]).toEqual(data);
    });

    it('should return error on reject request', async () => {
      const store = mockStore();
      const error = new Error('Test error');
      sandbox.stub(cloudinary, 'upload').returns(Promise.reject(error));

      const expectedActions = [
        actions.createWoNoteReq(),
        actions.createWoNoteFail(error),
      ];

      try {
        await store.dispatch(actions.createWorkOrderNote(1, data, fakeMoment));
        assert.fail();
      } catch (error) {
        expect(store.getActions()).toEqual(expectedActions);
      }
    });
  });
  describe('Fetch Work Order Notes', () => {
    let sandbox;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should return correct action object', () => {
      const error = 'Test error';
      expect(actions.fetchWoNotesReq()).toEqual({
        type: t.FETCH_WO_NOTES_REQUEST,
      });
      expect(actions.fetchWoNotesSuccess(data)).toEqual({
        type: t.FETCH_WO_NOTES_SUCCESS,
        notes: data,
      });
      expect(actions.fetchWoNotesFail(error)).toEqual({
        type: t.FETCH_WO_NOTES_FAILURE,
        error,
      });
    });

    it('should send request', async () => {
      const store = mockStore();
      const get = sandbox
        .stub(request, 'get')
        .returns(Promise.resolve({ data }));
      const workorderId = 1;
      const expectedActions = [
        actions.fetchWoNotesReq(),
        actions.fetchWoNotesSuccess(data),
      ];

      await store.dispatch(actions.fetchWorkOrderNotes(workorderId));
      expect(store.getActions()).toEqual(expectedActions);
      expect(get.args[0][0]).toBe(`workorders/${workorderId}/note`);
    });

    it('should return error on reject request', async () => {
      const store = mockStore();
      const error = new Error('Test error');
      sandbox.stub(request, 'get').returns(Promise.reject(error));

      const expectedActions = [
        actions.fetchWoNotesReq(),
        actions.fetchWoNotesFail(error),
      ];

      try {
        await store.dispatch(actions.fetchWorkOrderNotes(1));
        assert.fail();
      } catch (error) {
        expect(store.getActions()).toEqual(expectedActions);
      }
    });
  });
  describe('Fetch All Work Order Notes', () => {
    let sandbox;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should return correct action object', () => {
      const error = 'Test error';
      expect(actions.fetchAllWoNotesReq()).toEqual({
        type: t.FETCH_ALL_WO_NOTES_REQUEST,
      });
      expect(actions.fetchAllWoNotesSuccess(data)).toEqual({
        type: t.FETCH_ALL_WO_NOTES_SUCCESS,
        notes: data,
      });
      expect(actions.fetchAllWoNotesFail(error)).toEqual({
        type: t.FETCH_ALL_WO_NOTES_FAILURE,
        error,
      });
    });

    it('should make the request and return the notes', async () => {
      const notesData = [
        { note: { picture: 'pic.png', mediaRefId: '1' }, type: 'NOTE' },
      ];
      const store = mockStore();
      const get = sandbox
        .stub(request, 'get')
        .returns(Promise.resolve({ data: notesData }));

      const notes = [
        { note: { picture: 'pic.png', mediaRefId: '1' }, type: 'NOTE' },
      ];
      const workorderId = 2;
      const expectedActions = [
        actions.fetchAllWoNotesReq(),
        actions.fetchAllWoNotesSuccess(notes),
      ];

      await store.dispatch(actions.fetchAllWorkOrderNotes(workorderId));
      expect(store.getActions()).toEqual(expectedActions);
    });
    it('should display no work order notes if not of type NOTE', async () => {
      const notesData = [{ type: 'TRANSITION' }];
      const store = mockStore();
      const get = sandbox
        .stub(request, 'get')
        .returns(Promise.resolve({ data: notesData }));

      const notes = [];
      const workorderId = 2;
      const expectedActions = [
        actions.fetchAllWoNotesReq(),
        actions.fetchAllWoNotesSuccess(notes),
      ];

      await store.dispatch(actions.fetchAllWorkOrderNotes(workorderId));
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('should return error on reject request', async () => {
      const store = mockStore();
      const error = new Error('Test error');
      sandbox.stub(request, 'get').returns(Promise.reject(error));

      const expectedActions = [
        actions.fetchAllWoNotesReq(),
        actions.fetchAllWoNotesFail(error),
      ];

      try {
        await store.dispatch(actions.fetchAllWorkOrderNotes(1));
        assert.fail();
      } catch (error) {
        expect(store.getActions()).toEqual(expectedActions);
      }
    });
  });
});
