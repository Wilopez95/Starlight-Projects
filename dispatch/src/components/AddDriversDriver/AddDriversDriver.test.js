import { shallow } from 'enzyme';
import AddDriversDriver from './AddDriversDriver';

const driverData = {
  truck: {
    id: 1381,
    name: '412',
    description: null,
    type: 'TRUCK',
    waypointType: null,
    waypointName: null,
    location: {
      lon: -104.97474559999999,
      lat: 39.8311424,
    },
    createdBy: 'dan@marketsoup.com',
    createdDate: '2016-12-30T19:34:54.712Z',
    modifiedBy: 'Clopez',
    modifiedDate: '2019-10-15T20:47:12.687Z',
  },
  id: 81,
  name: 'Alfredo Santos Rt38',
  username: '5280driver34@gmail.com',
  photo: '',
  createdBy: 'smoore',
  createdDate: '2018-07-17T21:38:19.935Z',
  modifiedBy: 'strues',
  modifiedDate: '2019-10-16T13:50:23.624Z',
  deleted: 0,
  phoneNumber: '',
  truckImage: 'https://cdn.starlightpro.com/img/truck-icons/480000_truck.png',
  color: '#480000',
};

describe('<AddDriversDriver />', () => {
  it('should be successfully mounted', () => {
    const mockFn = jest.fn();
    const wrapper = shallow(
      <AddDriversDriver driver={driverData} onClickAddDriver={mockFn} />,
    );
    expect(wrapper).toBeDefined();
    expect(wrapper.find('.listview-content')).toHaveLength(1);
  });
  it('', () => {
    const mockFn = jest.fn();
    const wrapper = shallow(
      <AddDriversDriver driver={driverData} onClickAddDriver={mockFn} />,
    );

    expect(wrapper.find('.listview-content')).toHaveLength(1);
    wrapper.find('.listview-content').simulate('click');
    expect(mockFn).toBeCalled();
  });
});
