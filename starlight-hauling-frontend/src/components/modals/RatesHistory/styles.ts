import styled from 'styled-components';

import { Modal } from '@root/common';
import { TableBody, TableTools } from '@root/common/TableTools';

export const TableBodyStyled = styled(TableBody)`
  font-size: 1.75rem;
  tr {
    cursor: default;
  }
`;

export const ModalStyled = styled(Modal)`
  width: 742px;
  height: 622px;
  top: 50%;
  margin-top: -311px;
`;

export const TableScrollContainerStyled = styled(TableTools.ScrollContainer)`
  box-shadow: none;
`;
