import styled from 'styled-components';

export const Wrapper = styled.div<{ color: string }>`
  background: ${props => props.color};
  border-radius: 2px;
  width: 13px;
  height: 13px;
  min-width: 13px;
  min-height: 13px;
`;
