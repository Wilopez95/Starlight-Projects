import { shallow, mount } from 'enzyme';
import { Input } from './Input';

describe('<Input />', () => {
  const baseProps = {
    name: 'inputTest',
    label: 'Hey',
    disabled: false,
    formik: {
      handleChange: jest.fn(),
      handleBlur: jest.fn(),
      setFieldValue: jest.fn(),
      setFieldTouched: jest.fn(),
      touched: {},
      errors: {},
      values: {
        inputTest: '',
      },
    },
  };

  it('should render', () => {
    const wrapper = shallow(<Input {...baseProps} />);

    expect(wrapper).toBeDefined();
  });

  it('should allow custom className', () => {
    const props = {
      ...baseProps,
      className: 'Custom',
    };
    const wrapper = shallow(<Input {...props} />);

    expect(wrapper.hasClass(props.className)).toBe(true);
  });

  it('should have custom type', () => {
    const props = {
      ...baseProps,
      type: 'text',
    };
    const wrapper = mount(<Input {...props} />);

    expect(wrapper.find('input').prop('type')).toBe(props.type);
  });

  // it('should have a hint', () => {
  //   const props = {
  //     ...baseProps,
  //     helpText: 'helpText',
  //   };
  //   const wrapper = shallow(<Input {...props} />);

  //   expect(wrapper.find('.sui-form__hint').length).toBe(1);
  //   expect(wrapper.find('.sui-form__hint').text()).toBe(props.helpText);
  // });

  // it('should be disabled', () => {
  //   const wrapper = shallow(<Input {...baseProps} disabled />);

  //   expect(wrapper.find('input').prop('disabled')).toBe(true);
  //   expect(wrapper.prop('className').includes('sui-disabled'));
  // });

  it('should call onChange', () => {
    const wrapper = mount(<Input {...baseProps} />);
    wrapper.find('input').simulate('change');

    expect(baseProps.formik.handleChange).toHaveBeenCalled();
  });
});
