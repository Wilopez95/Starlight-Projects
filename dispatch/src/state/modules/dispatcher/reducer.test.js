import { dispatchFilterChange } from './actions';

// Reducer
import dispatcher, { initialState } from './reducer';

const data = {
  size: '10',
};

describe('Dispatcher reducer', () => {
  it('should have initial state', () => {
    const state = dispatcher(undefined, {});
    expect(state).toEqual(initialState);
  });

  it('should update driver on receive action', () => {
    const state = dispatcher(initialState, dispatchFilterChange(data));

    expect(state.filter).toHaveProperty('size', '10');
  });
});
