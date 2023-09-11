import { CrossIcon as CrossIconBase } from '@starlightpro/shared-components';
import styled from 'styled-components';

import { Table } from '@root/common/TableTools';

export const CrossIcon = styled(CrossIconBase)`
  height: 10px;
  width: 10px;

  path {
    fill: var(--caption-light);
  }
`;

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  --buttonContainerHeight: 85px;
`;

export const Container = styled.div`
  display: flex;
  width: 100%;
  height: calc(100% - var(--buttonContainerHeight));
`;

export const ScrollContainer = styled.div<{ height: number }>`
  width: 100%;
  height: ${p => p.height}px;

  position: relative;
  overflow-y: auto;
  padding: ${p => p.theme.offsets[3]};

  &::-webkit-scrollbar {
    height: 4px;
    width: 4px;
    margin-left: 5px;
  }

  &::-webkit-scrollbar-track {
    box-shadow: inset 0 0 4px rgba(0, 0, 0, 0.3);
  }

  &::-webkit-scrollbar-thumb {
    background-color: darkgrey;
    outline: 1px solid slategrey;
  }
`;

export const RightPanel = styled.div`
  width: 100%;
  height: 100%;
  padding: 5rem 3rem;
`;

export const ButtonContainer = styled.div`
  height: var(--buttonContainerHeight);
  max-height: var(--buttonContainerHeight);
  width: 100%;
  padding: ${p => p.theme.offsets[3]};
  padding-top: 0;
`;

export const QuickViewTable = styled(Table)`
  white-space: initial;
  overflow-x: auto;
  word-break: break-word;
`;

export const LoadingIndicatorWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1111;
  background: white;
`;
