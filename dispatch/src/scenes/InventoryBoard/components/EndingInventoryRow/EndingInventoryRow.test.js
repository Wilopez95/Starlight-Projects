import { shallow } from 'enzyme';
// import sinon from 'sinon';
import {
  CURRENT_INVENTORY,
  FINALS,
  // WORK_ORDERS,
} from 'scenes/InventoryBoard/__fixtures__/inventoryboard.fixture';
import EndingInventoryRow from './EndingInventoryRow';

// for tests to work with react media
global.matchMedia = media => ({
  addListener: () => {},
  removeListener: () => {},
  matches: media === '(min-width: 545px)',
});
describe('<EndingInventoryRow />', () => {
  const defaultProps = {
    totalPerSizeMapping: {
      10: 43,
      12: 43,
      20: 27,
      30: 91,
      40: 22,
      '40CT': 38,
    },
    size: '20',
    tallyOnTruckSizes: {
      TRUCK: {
        10: 2,
        12: 4,
        30: 15,
        40: 3,
        '40CT': 2,
      },
    },
    finals: FINALS,
    endingInventory: CURRENT_INVENTORY,
    today: '2019-09-04',
    tomorrow: '2019-09-05',
    thirdDay: '2019-09-06',
    fourthDay: '2019-09-07',
  };

  it('should be successfully mounted', () => {
    const wrapper = shallow(<EndingInventoryRow {...defaultProps} />);
    expect(wrapper).toBeDefined();
  });
  it('should  match the snapshot', () => {
    const wrapper = shallow(<EndingInventoryRow {...defaultProps} />);
    expect(wrapper).toMatchSnapshot();
  });
});
