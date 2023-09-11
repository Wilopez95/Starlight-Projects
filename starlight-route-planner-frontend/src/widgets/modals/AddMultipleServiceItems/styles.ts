import { Modal as BaseModal, Typography } from '@starlightpro/shared-components';
import styled from 'styled-components';

import {
  TableRow as TableRowBase,
  TableScrollContainer as TableScrollContainerBase,
} from '@root/common/TableTools';

export const Modal = styled(BaseModal)`
  top: 50%;
  transform: translate(-50%, -50%);
  max-height: 538px;
`;

export const TableScrollContainer = styled(TableScrollContainerBase)`
  height: 500px;
`;

export const TableRow = styled(TableRowBase)`
  height: 50px;
`;

export const TableTitle = styled(Typography)`
  max-width: 100px;
  padding-left: 15px;
`;
