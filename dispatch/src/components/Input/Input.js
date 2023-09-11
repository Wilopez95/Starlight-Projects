/* eslint-disable no-inline-comments */
import styled from 'styled-components';
import Label from '../Label';

const modifierColor = () => (props) => {
  if (props.disabled) {
    return '#7ED320';
  }
  return props.error ? '#c00' : '#434343';
};

const Input = styled.input`
  box-sizing: border-box;
  height: 34px;
  width: 100%;
  border-radius: 8px;
  color: #434343;
  background: #fafbfc;
  border: 1px solid ${modifierColor()};
  padding: 8px 0;
  padding-left: 12px;
  &:focus {
    border-color: ${modifierColor()};

    + ${/* sc-selector */ Label} {
      color: ${modifierColor()};
    }
  }
`;
export default Input;
