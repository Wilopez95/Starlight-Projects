import { shallow, mount } from 'enzyme';
// import sinon from 'sinon';
import { WORK_ORDERS } from 'scenes/InventoryBoard/__fixtures__/inventoryboard.fixture';
import TotalHaulsRow from './TotalHaulsRow';

// for tests to work with react media
global.matchMedia = media => ({
  addListener: () => {},
  removeListener: () => {},
  matches: media === '(min-width: 545px)',
});
describe('<TotalHaulsRow />', () => {
  const defaultProps = {
    workorders: WORK_ORDERS,
    today: '2019-09-04',
    tomorrow: '2019-09-05',
    thirdDay: '2019-09-06',
    fourthDay: '2019-09-07',
  };

  it('should be successfully mounted', () => {
    const wrapper = shallow(<TotalHaulsRow {...defaultProps} />);
    expect(wrapper).toBeDefined();
  });
  it('should  match the snapshot', () => {
    const wrapper = shallow(<TotalHaulsRow {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });
  it('should have 0 as the value for day 1', () => {
    const wrapper = mount(<TotalHaulsRow {...defaultProps} />);

    expect(wrapper.find('td.align-center.day-1').text()).toEqual('0');
  });
  it('should have 0 as the value for day 2', () => {
    const wrapper = mount(<TotalHaulsRow {...defaultProps} />);

    expect(wrapper.find('td.align-center.day-2').text()).toEqual('0');
  });
  it('should have 0 as the value for day 3', () => {
    const wrapper = mount(<TotalHaulsRow {...defaultProps} />);

    expect(wrapper.find('td.align-center.day-3').text()).toEqual('2');
  });
  it('should have 1 as the value for day 4', () => {
    const wrapper = mount(<TotalHaulsRow {...defaultProps} />);

    expect(wrapper.find('td.align-center.day-4').text()).toEqual('1');
  });
});
