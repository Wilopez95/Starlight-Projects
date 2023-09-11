import { Modal as ModalBase } from '@starlightpro/shared-components';
import styled from 'styled-components';

export const Modal = styled(ModalBase)`
  top: 50% !important;
  width: 510px;
  transform: translate(-50%, -50%) !important;
  height: 750px;
  width: 690px;
  padding: 40px;
  top: 50%;
`;

export const DetailsInfoWrapper = styled.div`
  width: 100%;
  max-width: 727px;
  max-height: 500px;
  height: 500px;
  object-fit: contain;
  position: relative;
  user-select: none;
  overflow: hidden;
  display: flex;
  align-items: flex-start;
`;

export const PdfPreviewWrapper = styled.iframe`
  width: 100%;
  height: 100%;
`;
