import { ITheme, PlusIcon as BasePlusIcon } from '@starlightpro/shared-components';
import styled from 'styled-components';

export const AddFilter = styled(BasePlusIcon)`
  width: 10px;
  height: 10px;
  color: ${(p: { theme: ITheme }) => p.theme.colors.secondary.desaturated};
`;
