import styled, { keyframes } from 'styled-components';

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
`;

const Loader = styled.div`
  position: relative;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #dfe3e8;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    left: 1px;
    top: 1px;
    z-index: 2;
    width: 22px;
    height: 22px;
    background: #fff;
    border-radius: 50%;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 12px;
    height: 12px;
    background: #e87900;
    animation: ${rotate} 1s linear infinite;
    transform-origin: 100% 100%;
  }
`;

export default Loader;
