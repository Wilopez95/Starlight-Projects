import { CrossIcon as CrossAsset } from '@starlightpro/shared-components';
import styled from 'styled-components';

export const StyledListItem = styled.div<{ readOnly?: boolean }>`
  border: ${props => (props.readOnly ? 'none' : '1px dashed var(--primary-gray)')};
  padding: 8px 12px;
  display: flex;
  position: relative;
  cursor: ${props => (props.readOnly ? 'default' : 'pointer')};
  z-index: 9999;
`;

export const CrossIcon = styled(CrossAsset)`
  position: absolute;
  top: 0.6rem;
  right: 0.6rem;
  cursor: pointer;
  z-index: 100;
  width: 15px;
  height: 15px;
`;

export const OrderedMarker = styled.div`
  position: relative;

  cursor: ${props => (props.onClick ? 'pointer' : 'default')};

  & > span {
    font-size: 9px;
    line-height: 18px;
    position: absolute;
    left: 50%;
    top: 40%;
    transform: translate(-50%, -50%);
    z-index: 1;
    cursor: pointer;
  }
`;
