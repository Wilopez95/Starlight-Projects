import { mount } from 'enzyme';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import ContextMenu from './ContextMenu';

describe('<ContextMenu />', () => {
  const initialState = {};

  const defaultProps = {
    menuId: 'menuId',
    workOrder: {
      id: 1,
    },
    showSelectLandfill: false,
    showCreateDropoff: false,
    showCreatePickup: false,
    waypoints: [
      {
        createdBy: 'dispatch3',
        createdDate: '2016-10-12T14:16:49.586Z',
        deleted: 0,
        id: 1,
        location: { lon: -104.984136, lat: 39.672826 },
        modifiedBy: 'terry.adams@starlightpro.com',
        modifiedDate: '2017-11-07T01:41:09.103Z',
        name: '8500 Peña Blvd, Denver, CO 80249',
        seedName: '8500 Peña Blvd, Denver, CO 80249',
        type: 'WAYPOINT',
        waypointName: 'Denver Intl Airport',
        waypointType: 'STORAGE_YARD',
      },
    ],
  };

  const testInstance = (props, state) => {
    const mockStore = configureMockStore([thunk]);
    const store = mockStore(state);

    const provider = mount(
      <Provider store={store}>
        <ContextMenu {...props} />
      </Provider>,
    );
    const wrapper = provider.find('CtxMenu');

    return { wrapper, provider };
  };

  it('should be successfully mounted', () => {
    const { wrapper } = testInstance(defaultProps, initialState);
    expect(wrapper).toBeDefined();
    expect(wrapper.find('#menuId')).toHaveLength(1);
  });
});
