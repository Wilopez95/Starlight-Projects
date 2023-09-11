import {
  getTemplates,
  templatesById,
  getTemplateIds,
  getTemplateById,
  selectTemplates,
  selectTemplateLoading,
  selectCurrentTemplate,
} from './selectors';

describe('Template Selectors', () => {
  test('getTemplates -- should select the templates state', () => {
    const templatesState = {
      byId: {},
      ids: [],
      current: {},
      isLoading: false,
      errorMessage: null,
      logo: {},
    };
    const mockedState = {
      templates: templatesState,
    };
    expect(getTemplates(mockedState)).toEqual(templatesState);
  });
  test('templatesById -- should select the templates byId state', () => {
    const byIdState = {
      1: {
        id: '1',
        name: 'test',
      },
    };
    const mockedState = {
      templates: {
        byId: {
          1: {
            id: '1',
            name: 'test',
          },
        },
        ids: [],
        isLoading: false,
        errorMessage: null,
        logo: {},
      },
    };
    expect(templatesById(mockedState)).toEqual(byIdState);
  });
  test('getTemplateIds -- should select the templates ids state', () => {
    const idsState = ['1'];
    const mockedState = {
      templates: {
        byId: {
          1: {
            id: '1',
            name: 'test',
          },
        },
        ids: ['1'],
        isLoading: false,
        errorMessage: null,
        logo: {},
      },
    };
    expect(getTemplateIds(mockedState)).toEqual(idsState);
  });
  test('selectTemplateLoading -- should select the templates isLoading state', () => {
    const loadingState = true;
    const mockedState = {
      templates: {
        byId: {},
        ids: [],
        isLoading: true,
        errorMessage: null,
        logo: {},
      },
    };
    expect(selectTemplateLoading(mockedState)).toEqual(loadingState);
  });
  test('selectTemplates -- should select the templates mapped byId and ids state', () => {
    const mappedState = [
      {
        id: '1',
        name: 'test',
      },
    ];
    const mockedState = {
      templates: {
        byId: {
          1: {
            id: '1',
            name: 'test',
          },
        },
        ids: ['1'],
        isLoading: false,
        errorMessage: null,
        logo: {},
      },
    };
    expect(selectTemplates(mockedState)).toEqual(mappedState);
  });
  test('getTemplateById -- should select a template from the byId state', () => {
    const byIdState = {
      id: '1',
      name: 'test',
    };

    const mockedState = {
      templates: {
        byId: {
          1: {
            id: '1',
            name: 'test',
          },
        },
        ids: ['1'],
        isLoading: false,
        errorMessage: null,
        logo: {},
      },
    };
    expect(getTemplateById(mockedState, '1')).toEqual(byIdState);
  });
  test('selectCurrentTemplate -- should select the current template state', () => {
    const currentState = {
      id: '1',
      name: 'test',
    };

    const mockedState = {
      templates: {
        byId: {},
        ids: [],
        current: {
          id: '1',
          name: 'test',
        },
        isLoading: false,
        errorMessage: null,
        logo: {},
      },
    };
    expect(selectCurrentTemplate(mockedState)).toEqual(currentState);
  });
});
