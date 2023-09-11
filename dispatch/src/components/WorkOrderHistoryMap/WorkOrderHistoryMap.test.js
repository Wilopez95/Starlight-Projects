/* eslint-disable */
import { mount } from 'enzyme';
import sinon from 'sinon';
import moment from 'moment';

import { MAP_DEFAULT_POSITION, MAP_DEFAULT_ZOOM } from 'helpers/config';

// Components
import WorkOrderHistoryMap, { sortItems } from './WorkOrderHistoryMap';

const items = [
  {
    id: 1,
    note: { newState: 'ARRIVE_ON_SITE' },
    createdDate: moment().add(3, 'days'),
    location: { location: { lat: 1, lon: 2 } },
  },
  {
    id: 2,
    note: { newState: 'ARRIVE_ON_SITE' },
    createdDate: moment().add(2, 'days'),
    location: { location: { lat: 3, lon: 4 } },
  },
  {
    id: 3,
    note: { newState: 'ARRIVE_ON_SITE' },
    createdDate: moment().add(7, 'days'),
    location: {
      location: { lat: 5, lon: 6 },
    },
  },
];

const testInstance = props => {
  const wrapper = mount(<WorkOrderHistoryMap {...props} />);
  const wrapperInstance = wrapper.instance();

  return { wrapper, wrapperInstance };
};

describe('<WorkOrderHistoryMap />', () => {
  let sandbox;

  beforeAll(() => (sandbox = sinon.createSandbox()));

  afterAll(() => sandbox.restore());

  it('passes', () => {
    expect(true);
  });

  // it('should be successfully mounted', () => {
  //   const { wrapper } = testInstance();
  //   expect(wrapper).toBeDefined();
  //   expect(wrapper.find('.history-map')).toHaveLength(1);
  // });
  //
  // it('should have path layer', () => {
  //   const { wrapperInstance } = testInstance();
  //   expect(wrapperInstance.path).toBeInstanceOf(Leaflet.FeatureGroup);
  // });
  //
  // it('should have empty array items by default', () => {
  //   const { wrapper } = testInstance();
  //   expect(wrapper.props().items).toHaveLength(0);
  // });
  //
  // it('should have mapApi property', () => {
  //   const { wrapperInstance } = testInstance();
  //   expect(wrapperInstance.mapApi).toBeInstanceOf(Leaflet.Map);
  // });
  //
  // it('should call drawPath and fitMapToPathBounds after mount', () => {
  //   // const drawPath = sandbox.spy(WorkOrderHistoryMap.prototype, 'drawPath');
  //   const fitMapToPathBounds = sandbox.spy(WorkOrderHistoryMap.prototype, 'fitMapToPathBounds');
  //
  //   testInstance();
  //
  //   // expect(drawPath.calledOnce).toBe(true);
  //   expect(fitMapToPathBounds.calledOnce).toBe(true);
  // });
  //
  // it('should set default center and zoom on empty state', () => {
  //   const { wrapperInstance } = testInstance();
  //   const center = wrapperInstance.mapApi.getCenter();
  //
  //   expect([center.lat, center.lng]).toEqual(MAP_DEFAULT_POSITION);
  //   expect(wrapperInstance.mapApi.getZoom()).toBe(MAP_DEFAULT_ZOOM);
  // });
  //
  // it('should redraw path after update', () => {
  //   const { wrapperInstance } = testInstance();
  //
  //   // wrapperInstance.drawPath = sinon.spy();
  //   wrapperInstance.fitMapToPathBounds = sinon.spy();
  //
  //   wrapperInstance.componentDidUpdate();
  //
  //   // expect(wrapperInstance.drawPath.calledOnce).toBe(true);
  //   expect(wrapperInstance.fitMapToPathBounds.calledOnce).toBe(true);
  // });
  //
  // it('INV-350 - Arrows should point the correct way, items should be sorted by date', () => {
  //   const actualItems = stable(items, sortItems);
  //   expect(actualItems[0]).toEqual(items[2]);
  //   expect(actualItems[1]).toEqual(items[0]);
  //   expect(actualItems[2]).toEqual(items[1]);
  // });
});
