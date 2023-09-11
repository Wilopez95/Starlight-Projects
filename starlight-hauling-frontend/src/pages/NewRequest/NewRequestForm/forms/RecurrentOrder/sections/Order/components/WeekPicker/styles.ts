import { Layouts } from '@starlightpro/shared-components';
import styled from 'styled-components';

import { Typography } from '@root/common';

export const StyledWrapper = styled(Layouts.Flex)`
  cursor: pointer;
  margin-right: ${({ theme }) => theme.offsets[0.5]};
  height: 5rem;
  width: 5rem;
  border-radius: 50%;

  ${Typography} {
    color: ${({ theme }) => theme.colors.secondary.desaturated};
  }

  &.selected,
  &:hover {
    background: ${({ theme }) => theme.colors.primary.desaturated};
    border: 1px solid ${({ theme }) => theme.colors.primary.standard};

    ${Typography} {
      color: ${({ theme }) => theme.colors.default.standard};
    }
  }
`;
