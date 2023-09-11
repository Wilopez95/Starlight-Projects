import { shallow, mount } from 'enzyme';
import WorkOrderHistoryDate from './WorkOrderHistoryDate';

const testDate = '2019-08-25T00:53:45.680Z';

describe('<WorkOrderHistoryDate />', () => {
  it('should render correctly with props', () => {
    const component = shallow(<WorkOrderHistoryDate createdDate={testDate} />);

    expect(component).toMatchSnapshot();
  });
  it('should render and display the date', () => {
    const wrapper = mount(<WorkOrderHistoryDate createdDate={testDate} />);
    expect(wrapper.props().createdDate).toEqual(testDate);

    expect(wrapper.text()).toContain('08');
  });
});
