import { Layouts } from '@starlightpro/shared-components';
import styled from 'styled-components';

import { CrossIcon } from '../../../../../assets';
import { ClickOutHandler } from '../../../../../common';

export const QuickViewWrapper = styled(ClickOutHandler)`
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
`;

export const Container = styled.div`
  height: 100%;
  overflow-y: auto;
`;

export const ContentGrid = styled(Layouts.Grid)`
  height: 100%;
`;

export const ScrollableFormWrapper = styled(Layouts.Scroll)`
  flex: 1 1 auto;
`;

export const CloseIcon = styled(CrossIcon)`
  cursor: pointer;
`;

export const ContentWrapper = styled.div`
  padding: ${props => props.theme.offsets[3]} 0 0;
  height: 100%;
`;
