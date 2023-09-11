// Libs
import { mount } from 'enzyme';
import sinon from 'sinon';
import { ActiveCan } from './ActiveCan';

const testCan = {
  name: '1',
  id: '1',
};

const testCanWithTransactions = {
  name: '2',
  id: '2',
  transactions: [
    {
      name: '1',
      id: '1',
      location2: {
        name: '22',
        location: {
          lat: 123,
          lon: 321,
        },
      },
    },
  ],
  timestamp: '2017-01-21T10:42:34.051Z',
  location: {
    name: '22',
    location: {
      lat: 123,
      lon: 321,
    },
  },
};

describe('<ActiveCan />', () => {
  it('should be successfully mounted', () => {
    const wrapper = mount(<ActiveCan timezone="America/Denver" />);
    expect(wrapper).toBeDefined();
  });

  it('should handle click outside', () => {
    const onClose = sinon.stub();
    const wrapper = mount(
      <ActiveCan
        timezone="America/Denver"
        onClose={onClose}
        activeCan={testCan}
      />,
    );
    const wrapperInstnace = wrapper.instance();
    wrapperInstnace.handleClickOutside();
    expect(onClose.calledOnce).toBe(true);
  });

  it('should call onEdit method', () => {
    const onEdit = sinon.stub();
    const wrapper = mount(
      <ActiveCan
        timezone="America/Denver"
        onEdit={onEdit}
        activeCan={testCan}
      />,
    );
    const wrapperInstnace = wrapper.instance();
    wrapperInstnace.onEdit();
    expect(onEdit.calledOnce).toBe(true);
  });

  it('should have loading', () => {
    const wrapper = mount(
      <ActiveCan
        timezone="America/Denver"
        activeCan={testCan}
        errorOnTransactions={false}
      />,
    );

    expect(wrapper.find('.status-message').text()).toBe('Loading transactions');
    wrapper.setProps({ activeCan: testCanWithTransactions });
    expect(wrapper.find('.status-message')).toHaveLength(0);
    wrapper.setProps({ errorOnTransactions: true });
  });
});
