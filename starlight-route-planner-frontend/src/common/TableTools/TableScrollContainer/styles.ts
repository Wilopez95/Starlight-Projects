import { Layouts } from '@starlightpro/shared-components';
import styled from 'styled-components';

export const Container = styled.div`
  white-space: nowrap;
  width: 100%;
  border-radius: 0 0 4px 4px;
  box-shadow: 0 2px 8px 0 rgba(33, 43, 54, 0.1);
  height: 100%;
  background-color: white;
  overflow: hidden;
`;

export const TableScroll = styled(Layouts.Scroll)`
  &::-webkit-scrollbar {
    &-track {
      border-top: 2px solid ${p => p.theme.colors.grey.standard};
    }

    &-button:single-button:vertical:decrement {
      display: block;
      opacity: 0;
      pointer-events: none;
      height: 60px;
    }
  }
`;
