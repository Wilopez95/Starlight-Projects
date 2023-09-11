import { MotionStyle } from 'framer-motion';
import styled from 'styled-components';

export const Container = styled.div`
  position: relative;
  width: 24px;
  height: 24px;
  box-sizing: 'border-box';
`;

export const CircleStyle: MotionStyle = {
  display: 'block',
  width: '24px',
  height: '24px',
  border: '1px solid #DFE3E8',
  borderTop: '1px solid #E87900',
  borderRadius: '50%',
  position: 'absolute',
  boxSizing: 'border-box',
  top: 0,
  left: 0,
};
