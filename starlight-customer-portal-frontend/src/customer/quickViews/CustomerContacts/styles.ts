import { Typography } from '@starlightpro/shared-components';
import styled from 'styled-components';

export const FormSubtitle = styled.div`
  font-size: 16px;
  font-weight: 500;
  line-height: 1.88;
  color: var(--dark);
`;

export const TypographyWrapper = styled(Typography)`
  &.disabled {
    color: var(--secondary-gray) !important;
    cursor: not-allowed !important;
  }
`;
