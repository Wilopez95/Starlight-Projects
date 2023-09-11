import {
  getMaterials,
  getMaterialsById,
  getMaterialsIds,
  getMaterialsLoading,
  selectMaterials,
  selectMaterial,
} from './selectors';

describe('Material Selectors', () => {
  test('getMaterials -- should select the materials state', () => {
    const materialsState = {
      byId: {},
      ids: [],
      isLoading: false,
      error: null,
    };
    const mockedState = {
      materials: materialsState,
    };
    expect(getMaterials(mockedState)).toEqual(materialsState);
  });
  test('getMaterialsById -- should select the materials byId state', () => {
    const byIdState = {
      1: {
        id: '1',
        name: 'test',
      },
    };
    const mockedState = {
      materials: {
        byId: {
          1: {
            id: '1',
            name: 'test',
          },
        },
        ids: [],
        isLoading: false,
        error: null,
      },
    };
    expect(getMaterialsById(mockedState)).toEqual(byIdState);
  });
  test('getMaterialsIds -- should select the materials ids state', () => {
    const idsState = ['1'];
    const mockedState = {
      materials: {
        byId: {
          1: {
            id: '1',
            name: 'test',
          },
        },
        ids: ['1'],
        isLoading: false,
        error: null,
      },
    };
    expect(getMaterialsIds(mockedState)).toEqual(idsState);
  });
  test('getMaterialsLoading -- should select the materials isLoading state', () => {
    const loadingState = true;
    const mockedState = {
      materials: {
        byId: {},
        ids: [],
        isLoading: true,
        error: null,
      },
    };
    expect(getMaterialsLoading(mockedState)).toEqual(loadingState);
  });
  test('selectMaterials -- should select the materials mapped byId and ids state', () => {
    const mappedState = [
      {
        id: '1',
        name: 'test',
      },
    ];
    const mockedState = {
      materials: {
        byId: {
          1: {
            id: '1',
            name: 'test',
          },
        },
        ids: ['1'],
        isLoading: false,
        error: null,
      },
    };
    expect(selectMaterials(mockedState)).toEqual(mappedState);
  });
  test('selectMaterial -- should select a material from the byId state', () => {
    const byIdState = {
      id: '1',
      name: 'test',
    };

    const mockedState = {
      materials: {
        byId: {
          1: {
            id: '1',
            name: 'test',
          },
        },
        ids: ['1'],
        isLoading: false,
        error: null,
      },
    };
    expect(selectMaterial(mockedState, '1')).toEqual(byIdState);
  });
});
