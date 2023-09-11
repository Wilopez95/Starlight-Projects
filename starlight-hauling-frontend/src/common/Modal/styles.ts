import styled from 'styled-components';

export const Overlay = styled.div<{ zIndex: number }>`
  z-index: ${p => p.zIndex};
`;
