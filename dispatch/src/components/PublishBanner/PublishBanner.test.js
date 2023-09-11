import { mount } from 'enzyme';
// import sinon from 'sinon';
import PublishBanner from './PublishBanner';

describe('<PublishBanner />', () => {
  const defaultProps = {
    showingBanner: false,
    unpublishedChanges: 0,
    onClickBanner: jest.fn(),
  };

  const testInstance = props => {
    const wrapper = mount(<PublishBanner {...props} />);
    return { wrapper };
  };

  it('should be successfully mounted', () => {
    const { wrapper } = testInstance(defaultProps);
    expect(wrapper).toBeDefined();
  });
  it('should render with the form visible', () => {
    const { wrapper } = testInstance(defaultProps);
    expect(wrapper.props().unpublishedChanges).toEqual(0);
  });
});
