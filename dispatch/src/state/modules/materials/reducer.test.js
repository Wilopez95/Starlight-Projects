import {
  fetchMaterialsRequest,
  fetchMaterialsSuccess,
  fetchMaterialsFailure,
  fetchMaterialRequest,
  fetchMaterialSuccess,
  fetchMaterialFailure,
  removeMaterialRequest,
  removeMaterialSuccess,
  createMaterialRequest,
  createMaterialSuccess,
  updateMaterialSuccess,
} from './actions';

import materials from './reducer';

const initialState = {
  byId: {},
  ids: [],
  isLoading: false,
  error: null,
};

describe('Materials reducer', () => {
  it('should be initialized with initial state', () => {
    const state = materials(undefined, {});
    expect(state).toEqual(initialState);
  });

  it('should add a material by id', () => {
    const fetchedMaterial = {
      result: [123],
      entities: {
        materials: {
          123: {
            id: 123,
            name: 'test',
          },
        },
      },
    };
    let state = materials(undefined, {});
    state = materials(state, fetchMaterialSuccess(fetchedMaterial));
    const byId = {
      123: {
        id: 123,
        name: 'test',
      },
    };
    expect(state.byId).toEqual(byId);
    expect(state.ids).toEqual([123]);
    expect(state.isLoading).toBe(false);
  });

  it('should display an error on fetchMaterialFailure', () => {
    let state = materials(undefined, {});
    state = materials(state, fetchMaterialFailure('not found'));

    expect(state).toEqual({ ...initialState, error: 'not found' });
  });

  it('should set isLoading state when fetching', () => {
    let state = materials(undefined, {});
    state = materials(state, fetchMaterialRequest());

    expect(state.isLoading).toBe(true);
  });

  it('should fetch materials and add to the store', () => {
    const fetchedMaterials = {
      result: [123, 456],
      entities: {
        materials: {
          123: {
            id: 123,
            name: 'test',
          },
          456: {
            id: 456,
            name: 'hello',
          },
        },
      },
    };
    let state = materials(undefined, {});
    state = materials(state, fetchMaterialsSuccess(fetchedMaterials));
    const expectedIds = [123, 456];
    const expectedById = {
      123: {
        id: 123,
        name: 'test',
      },
      456: {
        id: 456,
        name: 'hello',
      },
    };
    expect(state.ids).toEqual(expectedIds);
    expect(state.byId).toEqual(expectedById);
  });

  it('should set isLoading state on fetch materials request', () => {
    let state = materials(undefined, {});
    state = materials(state, fetchMaterialsRequest());

    expect(state.isLoading).toBe(true);
  });

  it('should set isLoading state on remove material request', () => {
    let state = materials(undefined, {});
    state = materials(state, removeMaterialRequest());

    expect(state.isLoading).toBe(true);
  });

  it('should set isLoading state on create material request', () => {
    let state = materials(undefined, {});
    state = materials(state, createMaterialRequest());

    expect(state.isLoading).toBe(true);
  });

  it('should display an error on fetchMaterialsFailure', () => {
    let state = materials(undefined, {});
    state = materials(state, fetchMaterialsFailure('not found'));

    expect(state).toEqual({ ...initialState, error: 'not found' });
  });

  it('should remove a deleted material from the store', () => {
    const expectedIds = [1];
    const byId = {
      1: {
        id: 1,
        name: 'test',
      },
      2: {
        id: 2,
        name: 'hello',
      },
    };
    const expectedById = {
      1: {
        id: 1,
        name: 'test',
      },
    };
    let state = materials({ ids: [1, 2], byId: byId }, {});
    state = materials(state, removeMaterialSuccess(2));

    expect(state.ids).toEqual(expectedIds);
    expect(state.byId).toEqual(expectedById);
  });
  it('should add a created material to the store', () => {
    const fetchedMaterials = {
      result: 123,
      entities: {
        materials: {
          123: {
            id: 123,
            name: 'test',
          },
        },
      },
    };
    const initialState = {
      byId: {
        453: {
          id: 453,
          name: 'test',
        },
      },
      ids: [453],
      isLoading: false,
    };
    let state = materials(initialState, {});
    state = materials(state, createMaterialSuccess(fetchedMaterials));
    const expectedIds = [453, 123];
    const expectedById = {
      453: {
        id: 453,
        name: 'test',
      },
      123: {
        id: 123,
        name: 'test',
      },
    };
    expect(state.ids).toEqual(expectedIds);
    expect(state.byId).toEqual(expectedById);
  });
  it('should add update a material in the store', () => {
    const fetchedMaterials = {
      result: 123,
      entities: {
        materials: {
          123: {
            id: 123,
            name: 'updated',
          },
        },
      },
    };
    const initialState = {
      byId: {
        123: {
          id: 123,
          name: 'test',
        },
      },
      ids: [123],
      isLoading: false,
    };
    let state = materials(initialState, {});
    state = materials(state, updateMaterialSuccess(fetchedMaterials));
    const expectedIds = [123];
    const expectedById = {
      123: {
        id: 123,
        name: 'updated',
      },
    };
    expect(state.ids).toEqual(expectedIds);
    expect(state.byId).toEqual(expectedById);
  });
});
