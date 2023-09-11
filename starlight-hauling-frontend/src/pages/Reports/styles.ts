import { Layouts } from '@starlightpro/shared-components';
import styled from 'styled-components';

import { TableRow } from '@root/common/TableTools';

export const TableRowStyled = styled(TableRow)`
  cursor: default;
  > td:nth-child(3) > div {
    visibility: hidden;
  }
  &:hover > td:nth-child(3) > div {
    visibility: visible;
  }
  &:active > td:nth-child(3) > div {
    visibility: visible;
  }
`;

export const ExagoImageWrapper = styled(Layouts.Box)`
  svg {
    width: auto;
    height: auto;
  }
  img {
    width: auto;
  }
  .wrMainLeftPaneTabContent {
    display: block !important;
  }
  .wrExpressViewSaveBtnContainer,
  .wrHtmlViewerEditBtnContainer {
    display: none;
  }
`;

export const CustomReportWrapper = styled(Layouts.Box)`
  svg {
    width: auto;
    height: auto;
  }
  img {
    width: auto;
  }
  .wrMainLeftPaneTabContent {
    display: block !important;
  }
`;

export const ReportWrapper = styled(Layouts.Box)`
  img {
    width: auto;
  }
`;
