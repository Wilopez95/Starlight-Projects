import { Modal as ModalBase } from '@starlightpro/shared-components';
import styled from 'styled-components';

export const Modal = styled(ModalBase)`
  top: 50%;
  min-width: 705px;
  height: 866px;
  transform: translate(-50%, -50%) !important;
`;

export const IFrame = styled.iframe`
  height: 100%;
  border: none;
`;
