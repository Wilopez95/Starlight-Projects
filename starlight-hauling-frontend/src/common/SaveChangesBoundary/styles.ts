import styled from 'styled-components';

export const BoundaryContainer = styled.div<{ zIndex: number }>(p => ({
  width: '100%',
  zIndex: p.zIndex,
  backgroundColor: p.theme.colors.grey.desaturated,
  position: 'relative',
}));
