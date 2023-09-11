/* eslint-disable no-inline-comments */
import { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Input from '../Input';

import Label from '../Label';

const ErrorBox = styled.div`
  /* background: #d0021b; */
  border-radius: 5px;
  font-size: 16px;
  color: #d0021b;
  font-weight: 700;
  text-align: left;
  padding: 5px 0;
  margin-top: 2px;
  margin-bottom: 19px;
`;
const InputContainer = styled.div`
  position: relative;
  padding: 12px 0;
`;

const Text = styled.span`
  color: #d0021b;
  size: 14px;
`;

class TextInput extends Component {
  static propTypes = {
    className: PropTypes.string,
    name: PropTypes.string.isRequired,
    label: PropTypes.string,
    placeholder: PropTypes.string,
    disabled: PropTypes.bool,
    block: PropTypes.bool,
    defaultValue: PropTypes.string,
    onChange: PropTypes.func,
    onBlur: PropTypes.func,
    error: PropTypes.string,
  };

  static contextTypes = {
    formik: PropTypes.object,
  };

  static defaultProps = {
    onChange: () => {},
    onBlur: () => {},
  };

  componentDidMount() {
    const { name, defaultValue } = this.props;
    const { formik } = this.context;

    if (formik) {
      if (defaultValue) {
        formik.setFieldValue(name, defaultValue);
      }
    }
  }

  render() {
    const {
      className,
      name,
      label,
      error: errorMessage,
      placeholder,
      block,
      ...props
    } = this.props;

    const { formik } = this.context;

    const inputProps = { ...props };
    let error = errorMessage;

    if (formik) {
      inputProps.value = formik.values[name];
      delete inputProps.defaultValue;
      inputProps.onChange = (...args) => {
        formik.handleChange(...args);
        props.onChange(...args);
      };
      inputProps.onBlur = (...args) => {
        formik.handleBlur(...args);
        props.onBlur(...args);
      };
      error = formik.touched[name] && formik.errors[name];
    }

    return (
      <InputContainer className={className}>
        <Label htmlFor={name} error={error}>
          {label}
        </Label>
        <Input
          id={name}
          placeholder={placeholder}
          error={error}
          block={block}
          {...inputProps}
          {...props}
        />
        {error ? (
          <ErrorBox>
            <Text>{error}</Text>
          </ErrorBox>
        ) : null}
      </InputContainer>
    );
  }
}

export default TextInput;
