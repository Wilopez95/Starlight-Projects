import { shallow } from 'enzyme';
import ForgotPassword from './ForgotPassword';

describe('<ForgotPassword />', () => {
  it('renders without crashing', () => {
    const wrapper = shallow(<ForgotPassword />);

    expect(wrapper).toMatchSnapshot();
  });
  it('its state is unsubmitted by default', () => {
    const wrapper = shallow(<ForgotPassword />);

    expect(wrapper.state().submitted).toEqual(false);
  });
});
