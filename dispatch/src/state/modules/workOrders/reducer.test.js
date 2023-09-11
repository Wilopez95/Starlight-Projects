/* eslint-disable complexity, camelcase, babel/camelcase, func-names */
import moment from 'moment';
import {
  createWoSuccess,
  updateWoSuccess,
  fetchWOsReq,
  fetchWoSuccess,
  fetchWOsSuccess,
  receiveFilteredWOs,
  removeWoSuccess,
  filterChange,
  setActiveWorkOrder,
  unsetActiveWorkOrder,
  fetchWoReq,
  forgetWorkOrder,
} from './actions';

import workOrders, { initialState } from './reducer';

describe('work orders reducer', () => {
  it('should have initial state', () => {
    const state = workOrders(undefined, {});
    expect(state).toEqual(initialState);
  });

  it('should filter by today by default', () => {
    const date = {
      startDate: moment().startOf('day').valueOf(),
      endDate: moment().endOf('day').valueOf(),
    };

    expect(initialState.filter.date).toEqual(date);
  });

  it('should add workOrder on create action', () => {
    const testWorkOrder = { id: 1 };
    const state = workOrders(undefined, createWoSuccess(testWorkOrder));

    expect(state.list.length).toBe(1);
    expect(state.list[0]).toEqual(testWorkOrder);
    expect(state.filtered.length).toBe(1);
    expect(state.filtered[0]).toEqual(testWorkOrder);

    const stateAfterAction = workOrders(state, createWoSuccess(testWorkOrder));
    expect(stateAfterAction.list.length).toBe(1);
    expect(stateAfterAction.filtered.length).toBe(1);
  });

  it('should update workOrder on update action', () => {
    const testWorkOrder = { id: 1, a: 2 };
    const state = workOrders(
      {
        ...initialState,
        list: [{ id: 1, a: 1 }],
        filtered: [{ id: 1, a: 1 }],
      },
      updateWoSuccess(testWorkOrder),
    );

    expect(state.list.length).toBe(1);
    expect(state.list[0]).toEqual(testWorkOrder);
    expect(state.filtered.length).toBe(1);
    expect(state.filtered[0]).toEqual(testWorkOrder);
  });

  it('should toggle active workOrder', () => {
    const testWorkOrder = { id: 1, a: 2 };
    let state = workOrders(undefined, setActiveWorkOrder(testWorkOrder));
    expect(state.active).toEqual(testWorkOrder);
    state = workOrders(state, unsetActiveWorkOrder());
    expect(state.active).toBe(false);
  });

  it('should toggle isLoading state', () => {
    let state = workOrders(undefined, fetchWOsReq());

    expect(state.isLoading).toBe(true);

    state = workOrders(state, fetchWoSuccess([]));

    expect(state.isLoading).toBe(false);
  });

  it('should replace workorders on received workorders', () => {
    const fetchedWorkorders = [{ id: 1 }, { id: 2 }];
    const state = workOrders(undefined, fetchWOsSuccess(fetchedWorkorders));

    expect(state.list).toEqual(fetchedWorkorders);
  });

  it('should save filtered workorders', () => {
    const fetchedWorkorders = [
      {
        id: 1,
        modifiedDate: '',
        modifiedBy: '',
        actionType: 'DELIVERY',
        action_alias: 'DELIVERY',
        driver: {
          modifiedDate: '',
          modifiedBy: '',
          truck: {
            modifiedDate: '',
            modifiedBy: '',
            location: {},
          },
        },
      },
      {
        id: 2,
        modifiedDate: '',
        modifiedBy: '',
        actionType: 'DELIVERY',
        action_alias: 'DELIVERY',
        driver: {
          modifiedDate: '',
          modifiedBy: '',
          truck: {
            modifiedDate: '',
            modifiedBy: '',
            location: {},
          },
        },
      },
    ];
    const state = workOrders(undefined, receiveFilteredWOs(fetchedWorkorders));

    expect(state.filtered).toEqual(fetchedWorkorders);
    expect(state.list).toEqual([]);
  });

  it('should remove workorder', () => {
    const fetchedWorkorders = [
      {
        id: 1,
        modifiedDate: '',
        modifiedBy: '',
        actionType: 'DELIVERY',
        action_alias: 'DELIVERY',
        driver: {
          modifiedDate: '',
          modifiedBy: '',
          truck: {
            modifiedDate: '',
            modifiedBy: '',
            location: {},
          },
        },
      },
      {
        id: 2,
        modifiedDate: '',
        modifiedBy: '',
        actionType: 'DELIVERY',
        action_alias: 'DELIVERY',
        driver: {
          modifiedDate: '',
          modifiedBy: '',
          truck: {
            modifiedDate: '',
            modifiedBy: '',
            location: {},
          },
        },
      },
    ];
    let state = workOrders(undefined, fetchWOsSuccess(fetchedWorkorders));
    state = workOrders(state, receiveFilteredWOs(fetchedWorkorders));
    state = workOrders(state, removeWoSuccess(fetchedWorkorders[0].id));
    expect(state.list.length).toBe(fetchedWorkorders.length - 1);
    expect(state.filtered.length).toBe(fetchedWorkorders.length - 1);
  });

  it('should change filter', () => {
    const filter = { search: '123' };
    const state = workOrders(undefined, filterChange(filter));

    expect(state.filter).toEqual({ ...initialState.filter, ...filter });
  });
  it('should set state to isLoading on fetch work order request', () => {
    const state = workOrders(undefined, fetchWoReq());
    expect(state).toHaveProperty('isLoading', true);
  });

  it('should set single on receive work order action', () => {
    const state = workOrders(undefined, fetchWoSuccess('a:1'));
    expect(state).toHaveProperty('single', 'a:1');
  });

  it('should forget work order', () => {
    const init = {
      ...initialState,
      single: { id: 1 },
    };
    let state = workOrders(init, {});
    state = workOrders(state, forgetWorkOrder());

    expect(state).toEqual(initialState);
  });
});
