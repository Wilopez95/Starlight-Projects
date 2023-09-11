import { Layouts } from '@starlightpro/shared-components';
import styled from 'styled-components';

export const Hovered = styled(Layouts.Box)`
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.grey.desaturated ?? theme.colors.grey.standard};

    ${Layouts.IconLayout} {
      & path {
        fill: ${({ theme }) => theme.colors.primary.standard};
      }
    }
  }
`;

export const Disabled = styled(Layouts.Box)`
  cursor: not-allowed;
  opacity: 0.5;
`;
