import styled from 'styled-components';

export const TimePickerWrapper = styled.div`
  position: relative;
  margin-top: 1rem;

  & > div > label {
    display: block;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
  }

  input {
    padding-right: 34px;
  }
  svg {
    position: absolute;
    top: 50%;
    right: 10px;
    transform: translateY(-50%);
  }
`;
