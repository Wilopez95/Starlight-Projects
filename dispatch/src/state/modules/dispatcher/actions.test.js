/* eslint-disable no-catch-shadow, babel/camelcase, camelcase, no-unused-vars */
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as actions from './actions';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

const data = {
  size: '10',
};

describe('Dispatcher Actions', () => {
  it('should return correct action object', () => {
    expect(actions.dispatchFilterChange()).toEqual({
      type: actions.DISPATCH_FILTER_CHANGE,
    });
  });

  it('should change the filter', async () => {
    const store = mockStore();

    const expectedActions = [actions.dispatchFilterChange(data)];

    await store.dispatch(actions.dispatchFilterChange(data));
    expect(store.getActions()).toEqual(expectedActions);
  });
});
