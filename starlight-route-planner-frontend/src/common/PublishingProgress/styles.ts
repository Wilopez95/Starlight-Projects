import {
  CrossIcon as CrossIconBase,
  Layouts,
  LoaderDoubleIcon as LoaderDoubleIconBase,
} from '@starlightpro/shared-components';
import styled from 'styled-components';

export const CrossIcon = styled(CrossIconBase)`
  height: 8px;
  width: 8px;
  stroke: var(--caption-dark);
`;

export const LoaderDoubleIcon = styled(LoaderDoubleIconBase as React.FC)<{
  desaturated?: boolean;
}>`
  height: 20px;
  width: 20px;

  path {
    fill: ${p =>
      p.desaturated ? p.theme.colors.secondary.desaturated : p.theme.colors.primary.standard};
  }
`;

export const Wrapper = styled(Layouts.Box)`
  display: flex;
  flex-direction: column;
`;

export const Box = styled(Layouts.Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: inset 0px -1px 0px rgba(0, 0, 0, 0.1);
`;
