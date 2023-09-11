import { Typography } from '@starlightpro/shared-components';
import styled from 'styled-components';

export const ContentLayout = styled(Typography)`
  overflow: hidden;
  flex-direction: column;
`;

export const Layout = styled(ContentLayout)`
  height: 100%;
  display: flex;
  max-width: 100vw;
  overflow: hidden;
  max-height: calc(100vh - var(--headerHeight));
`;
