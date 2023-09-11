import { type Colors, Layouts } from '@starlightpro/shared-components';
import styled, { css } from 'styled-components';

import { Banner as BaseBanner } from '@root/common';

interface IDraftPanel {
  expanded: boolean;
}

export const Panel = styled.div<IDraftPanel>`
  background: ${({ theme }) => theme.colors.grey.desaturated ?? theme.colors.grey.standard};
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.colors.grey.dark ?? theme.colors.grey.standard};
  padding: 16px;

  ${({ expanded, theme }) =>
    expanded &&
    `
    background: ${theme.colors.grey.desaturated ?? theme.colors.grey.standard};
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
`}
`;

export const ProblemPanel = styled(Panel)<IDraftPanel & { color: Colors }>`
  background: ${({ theme, color }) => theme.colors[color].desaturated};

  ${({ expanded }) =>
    expanded &&
    css`
      border-radius: 4px 4px 0 0;
    `}
`;

export const Content = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.grey.dark};
  border-top: none;
  border-bottom-right-radius: 4px;
  border-bottom-left-radius: 4px;
  padding: 16px;
`;

export const Banner = styled(BaseBanner)`
  flex: 1;

  ${Layouts.Padding} {
    padding: 0;
  }
`;
