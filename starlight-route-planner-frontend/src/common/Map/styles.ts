import { MapSettingsIcon as MapSettingsIconBase } from '@starlightpro/shared-components';
import styled from 'styled-components';

interface IMarkerInner {
  color?: string;
  isDragging?: boolean;
}

export const MarkerInner = styled.div<IMarkerInner>`
  color: var(--white);
  position: relative;
  opacity: ${props => (props.isDragging ? '0.5' : '1')};

  span {
    position: absolute;
    left: 50%;
    top: 40%;
    transform: translate(-50%, -50%);
    z-index: 1;
    cursor: pointer;
  }
`;

export const MapSettingsIcon = styled(MapSettingsIconBase)`
  position: absolute;
  right: 1px;
  bottom: 30px;
  width: 40px;
  height: 40px;
  cursor: pointer;
  pointer-events: auto;
`;
