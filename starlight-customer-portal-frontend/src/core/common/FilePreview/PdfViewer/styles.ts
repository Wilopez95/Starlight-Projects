import { Page as PdfPage } from 'react-pdf/dist/esm/entry.webpack';
import { Layouts } from '@starlightpro/shared-components';
import styled from 'styled-components';

export const PdfContainer = styled(Layouts.Scroll)`
  margin-top: ${(p) => p.theme.offsets[2]};

  canvas {
    margin: 0 auto;
  }
`;

export const Page = styled(PdfPage)`
  &:not(:last-child) {
    margin-bottom: ${(p) => p.theme.offsets[2]};
  }
`;
